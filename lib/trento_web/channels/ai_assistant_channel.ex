# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannel do
  @moduledoc """
  Phoenix Channel for the AI Assistant.

  Bridges the React assistant-ui client (AG-UI protocol over WebSocket) to a
  `Sagents.AgentServer` keyed on the JS-supplied `thread_id`. State lives in
  the AgentServer until inactivity timeout.

  AG-UI wire emission lives in `TrentoWeb.AIAssistant.AgUi`.

  ## Socket assigns

  The channel keeps a small set of process-local assigns to track the
  current run. All are scoped to one channel process — no DB persistence.

  | Assign | Type | Lifetime | Why |
  |---|---|---|---|
  | `:current_user_id` | integer | from `UserSocket.connect` | auth + identifies the authenticated user |
  | `:current_scope` | `%Trento.Users.User{id: id}` | from `join/3` | passed to `Sagents.Agent.new!` as `:scope` so tool callbacks see `context.scope.id` |
  | `:loading` | boolean | toggled per run | double-send guard — prevents race conditions |
  | `:current_run_id` | UUID string | set at each `send_message` | echoed in `RUN_STARTED` + `RUN_FINISHED` AG-UI events for client-side correlation |
  | `:current_thread_id` | UUID string | set at each `send_message` | used as the sagents `agent_id` + echoed in run events |
  | `:message_id` | UUID string | set per run | identifies the assistant text-message lifecycle (`TEXT_MESSAGE_*`); also used as `parent_message_id` for `TOOL_CALL_START`. Currently equals `:current_run_id` but kept separate so future multi-message-per-run flows |
  | `:message_started` | boolean | per run | tracks whether `TEXT_MESSAGE_START` has been emitted — drives "skip duplicate START on subsequent deltas" + "skip orphan END at :idle when no text streamed" |
  | `:run_has_started` | boolean | per run | stale-`:idle` guard. `Sagents.AgentServer.init/1` broadcasts `{:status_changed, :idle, nil}` at boot and on Horde `node_transferred`; this flag is only set on the `:running` event for THIS run, so we ignore stray initial idles |

  ### Mutation surfaces

  All run-state mutations go through three private helpers:

  - `stash_run_ids/3` — at the head of `handle_in("send_message", ...)`, before validation.
  - `activate_run/2` — once the agent is alive + subscribed + first message added; marks `:loading: true` and zeros per-run booleans.
  - `reset_run/1` — on `:idle` (success), `:error`, and `run_agent` failure; clears per-run booleans and `:loading`. Leaves the IDs alone — next `send_message` overwrites them.

  `:running` and `:llm_deltas` perform single-flag flips inline
  (`run_has_started`, `message_started`).
  """

  use TrentoWeb, :channel
  require Logger

  alias LangChain.LangChainError
  alias LangChain.Message
  alias Sagents.{AgentsDynamicSupervisor, AgentServer}

  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.AI.ModelConfig
  alias Trento.Users.User
  alias TrentoWeb.AIAssistant.AgUi

  @impl true
  def join(
        "ai_assistant:" <> user_id,
        _session,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    if allowed?(user_id, current_user_id) do
      {:ok,
       socket
       |> assign(:current_scope, %User{id: current_user_id})
       |> assign(:loading, false)}
    else
      {:error, :unauthorized}
    end
  end

  def join("ai_assistant:" <> _user_id, _payload, _socket), do: {:error, :user_not_logged}

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  @impl true
  def handle_in(
        "send_message",
        %{"message" => prompt, "run_id" => run_id, "thread_id" => thread_id},
        socket
      )
      when is_binary(prompt) and is_binary(run_id) and is_binary(thread_id) do
    socket
    |> stash_run_ids(run_id, thread_id)
    |> handle_incoming_prompt(String.trim(prompt))
  end

  def handle_in("send_message", payload, socket) do
    Logger.warning("Invalid send_message payload: #{inspect(payload)}")
    {:reply, {:error, :invalid_payload}, socket}
  end

  defp handle_incoming_prompt(%{assigns: %{loading: true}} = socket, _prompt),
    do: {:noreply, socket}

  defp handle_incoming_prompt(socket, ""), do: {:noreply, socket}

  defp handle_incoming_prompt(
         %{assigns: %{current_scope: %{id: current_user_id}}} = socket,
         prompt
       ) do
    case ModelConfig.build_user_model_config(current_user_id) do
      {:ok, model_config} ->
        run_agent(socket, model_config, prompt)

      {:error, :no_ai_configuration} ->
        {:noreply,
         AgUi.run_error(socket, "Failed to start agent. No AI configuration found for user.")}

      {:error, :unsupported_provider} ->
        {:noreply,
         AgUi.run_error(socket, "Failed to start agent. Unsupported AI provider configured.")}

      {:error, :user_not_found} ->
        {:noreply, AgUi.run_error(socket, "Failed to start agent. User not found.")}
    end
  end

  defp run_agent(
         %{
           assigns: %{
             current_run_id: run_id,
             current_thread_id: thread_id,
             current_scope: scope
           }
         } = socket,
         model_config,
         prompt
       ) do
    agent = TrentoAIAgent.new!(agent_id: thread_id, model: model_config, scope: scope)

    updated_socket =
      with {:ok, _} <- ensure_agent_started(thread_id, agent),
           :ok <- AgentServer.subscribe(thread_id),
           :ok <- AgentServer.add_message(thread_id, Message.new_user!(prompt)) do
        socket
        |> activate_run(run_id)
        |> AgUi.run_started(run_id, thread_id)
      else
        {:error, reason} ->
          error_msg = "Failed to start agent: #{inspect(reason)}"
          Logger.error(error_msg)

          socket
          |> reset_run()
          |> AgUi.run_error(error_msg)
      end

    {:noreply, updated_socket}
  end

  defp ensure_agent_started(thread_id, agent) do
    AgentsDynamicSupervisor.start_agent_sync(
      agent_id: thread_id,
      agent: agent,
      pubsub: {Phoenix.PubSub, Trento.PubSub}
    )
  end

  @impl true
  def handle_info({:agent, {:status_changed, :running, nil}}, socket),
    do: {:noreply, assign(socket, :run_has_started, true)}

  @impl true
  def handle_info(
        {:agent, {:status_changed, :idle, _data}},
        %{
          assigns: %{
            run_has_started: true,
            message_started: message_started,
            message_id: message_id,
            current_thread_id: thread_id,
            current_run_id: run_id
          }
        } = socket
      ) do
    {:noreply,
     socket
     |> AgUi.maybe_text_message_end(message_started, message_id)
     |> reset_run()
     |> AgUi.run_finished(run_id, thread_id)}
  end

  def handle_info(
        {:agent, {:status_changed, :idle, _data}},
        %{assigns: %{run_has_started: false}} = socket
      ) do
    Logger.warning("Ignoring stale :idle event - run hasn't started yet")
    {:noreply, socket}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :error, reason}}, socket) do
    Logger.error("Agent execution failed: #{inspect(reason)}")

    error_message =
      case reason do
        %LangChainError{message: m} -> "Sorry, I encountered an error: #{m}"
        other -> "Sorry, I encountered an error: #{inspect(other)}"
      end

    {:noreply,
     socket
     |> reset_run()
     |> AgUi.run_error(error_message)}
  end

  @impl true
  def handle_info(
        {:agent, {:llm_deltas, deltas}},
        %{assigns: %{message_id: message_id}} = socket
      ) do
    text = Enum.map_join(deltas, "", &delta_text/1)

    {:noreply,
     socket
     |> AgUi.maybe_text_message_start()
     |> AgUi.maybe_text_message_content(message_id, text)}
  end

  @impl true
  def handle_info(
        {:agent, {:tool_call_identified, tool_info}},
        %{assigns: %{message_id: message_id}} = socket
      ) do
    {:noreply, AgUi.tool_call_lifecycle(socket, tool_info, message_id)}
  end

  @impl true
  def handle_info(
        {:agent, {:tool_execution_update, :completed, %{call_id: call_id} = tool_info}},
        socket
      ) do
    {:noreply, AgUi.tool_call_result(socket, call_id, tool_info[:result] || %{})}
  end

  @impl true
  def handle_info(_msg, socket), do: {:noreply, socket}

  defp delta_text(%{content: %{type: :text, content: text}}), do: text
  defp delta_text(%{content: text}) when is_binary(text), do: text
  defp delta_text(text) when is_binary(text), do: text
  defp delta_text(_), do: ""

  # See "Mutation surfaces" in the moduledoc.
  defp stash_run_ids(socket, run_id, thread_id) do
    socket
    |> assign(:current_run_id, run_id)
    |> assign(:current_thread_id, thread_id)
  end

  defp activate_run(socket, run_id) do
    socket
    |> assign(:loading, true)
    |> assign(:message_id, run_id)
    |> assign(:message_started, false)
    |> assign(:run_has_started, false)
  end

  defp reset_run(socket) do
    socket
    |> assign(:loading, false)
    |> assign(:message_started, false)
    |> assign(:run_has_started, false)
  end
end
