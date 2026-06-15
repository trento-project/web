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
  | `:access_token` | string | from `UserSocket.connect` | raw JWT, forwarded to remote AI tools via `tool_context.access_token` so wanda etc. can authenticate the user on outbound calls |
  | `:request_origin` | string \| nil | from `UserSocket.connect` | scheme + host + port of the websocket request, forwarded via `tool_context.request_origin` so `Trento.AI.RemoteHttpTool` can resolve partial `:checks_service` base URLs (e.g. `/wanda`) against the same origin the browser used |
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

  alias Trento.AI
  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.AI.LLMBuilder
  alias Trento.Users.User
  alias TrentoWeb.AIAssistant.AgUi
  alias TrentoWeb.Auth.AccessToken

  @impl true
  def join(
        "ai_assistant:" <> user_id,
        %{"access_token" => token},
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    with :ok <- check_ai_enabled(),
         :ok <- check_socket_and_channel_user_match(user_id, current_user_id),
         :ok <- validate_access_token(token, current_user_id) do
      {:ok,
       socket
       |> assign(:access_token, token)
       |> assign(:current_scope, %User{id: current_user_id})
       |> assign(:loading, false)}
    end
  end

  def join("ai_assistant:" <> _user_id, _payload, _socket), do: {:error, :user_not_logged}

  @impl true
  def handle_in(
        "send_message",
        %{
          "message" => prompt,
          "run_id" => run_id,
          "thread_id" => thread_id,
          "access_token" => token
        },
        %{assigns: %{current_user_id: current_user_id}} = socket
      )
      when is_binary(prompt) and is_binary(run_id) and is_binary(thread_id) do
    case validate_access_token(token, current_user_id) do
      :ok ->
        socket
        |> assign(:access_token, token)
        |> handle_incoming_prompt(String.trim(prompt), run_id, thread_id)

      {:error, _} = error ->
        {:reply, error, socket}
    end
  end

  def handle_in("send_message", payload, socket) do
    payload
    |> redact_payload()
    |> then(&Logger.warning("Received invalid send_message payload: #{inspect(&1)}"))

    {:reply, {:error, :invalid_payload}, socket}
  end

  defp check_ai_enabled do
    case AI.enabled?() do
      true -> :ok
      false -> {:error, :ai_assistant_disabled}
    end
  end

  defp check_socket_and_channel_user_match(user_id, current_user_id) do
    case allowed?(user_id, current_user_id) do
      true -> :ok
      false -> {:error, :unauthorized}
    end
  end

  defp allowed?(user_id, current_user_id) do
    case Integer.parse(user_id) do
      {id, ""} ->
        id == current_user_id

      _ ->
        Logger.warning("Invalid user_id in AI Assistant Channel topic: #{user_id}")
        false
    end
  end

  defp validate_access_token(token, current_user_id) do
    case AccessToken.verify_and_validate(token) do
      {:ok, %{"sub" => ^current_user_id}} -> :ok
      _ -> {:error, :unauthorized}
    end
  end

  defp handle_incoming_prompt(
         %{assigns: %{loading: true}} = socket,
         _prompt,
         _run_id,
         _thread_id
       ),
       do: {:noreply, socket}

  defp handle_incoming_prompt(socket, "", _run_id, _thread_id), do: {:noreply, socket}

  defp handle_incoming_prompt(
         %{assigns: %{current_scope: %{id: current_user_id}}} = socket,
         prompt,
         run_id,
         thread_id
       ) do
    case LLMBuilder.build_for_user(current_user_id) do
      {:ok, model_config} ->
        socket
        |> stash_run_ids(run_id, thread_id)
        |> run_agent(model_config, prompt)

      {:error, reason} ->
        {:noreply, AgUi.run_error(socket, model_setup_error(reason))}
    end
  end

  defp model_setup_error(:no_ai_configuration),
    do: "Failed to start agent. No AI configuration found for user."

  defp model_setup_error(:user_not_found),
    do: "Failed to start agent. User not found."

  defp run_agent(
         %{
           assigns: %{
             current_run_id: run_id,
             current_thread_id: thread_id,
             current_scope: scope,
             access_token: access_token,
             request_origin: request_origin
           }
         } = socket,
         model_config,
         prompt
       ) do
    [
      agent_id: thread_id,
      model: model_config,
      scope: scope,
      tool_context: %{
        access_token: access_token,
        request_origin: request_origin
      }
    ]
    |> TrentoAIAgent.new!()
    |> TrentoAIAgent.run(
      prompt,
      refresh_when: &access_token_changed/2
    )
    |> case do
      :ok ->
        socket
        |> activate_run(run_id)
        |> AgUi.run_started(run_id, thread_id)

      {:error, reason} ->
        error_msg = "Failed to start agent: #{inspect(reason)}"
        Logger.error(error_msg)

        socket
        |> reset_run()
        |> AgUi.run_error(error_msg)
    end
    |> then(&{:noreply, &1})
  end

  defp access_token_changed(
         %{tool_context: %{access_token: token}} = _current_agent,
         %{tool_context: %{access_token: token}} = _new_agent
       ) do
    # IO.inspect("access token unchanged - no agent update needed")
    :noop
  end

  defp access_token_changed(_current_agent, new_agent) do
    # IO.inspect("access token changed - refreshing agent with new token")
    {:ok, new_agent}
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
      ),
      do:
        {:noreply,
         socket
         |> AgUi.maybe_text_message_end(message_started, message_id)
         |> reset_run()
         |> AgUi.run_finished(run_id, thread_id)}

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

    {:noreply,
     socket
     |> reset_run()
     |> AgUi.run_error(reason)}
  end

  @impl true
  def handle_info(
        {:agent, {:llm_deltas, deltas}},
        %{assigns: %{message_id: message_id}} = socket
      ),
      do:
        deltas
        |> Enum.map_join("", &delta_text/1)
        |> then(
          &{:noreply,
           socket
           |> AgUi.maybe_text_message_start()
           |> AgUi.maybe_text_message_content(message_id, &1)}
        )

  @impl true
  def handle_info(
        {:agent, {:tool_call_identified, tool_info}},
        %{assigns: %{message_id: message_id}} = socket
      ),
      do: {:noreply, AgUi.tool_call_lifecycle(socket, tool_info, message_id)}

  @impl true
  def handle_info(
        {:agent, {:tool_execution_update, :completed, %{call_id: call_id} = tool_info}},
        socket
      ),
      do: {:noreply, AgUi.tool_call_result(socket, call_id, tool_info[:result] || %{})}

  @impl true
  def handle_info(_msg, socket), do: {:noreply, socket}

  defp delta_text(%{content: %{type: :text, content: text}}), do: text
  defp delta_text(%{content: text}) when is_binary(text), do: text
  defp delta_text(text) when is_binary(text), do: text
  defp delta_text(_), do: ""

  # See "Mutation surfaces" in the moduledoc.
  defp stash_run_ids(socket, run_id, thread_id),
    do:
      socket
      |> assign(:current_run_id, run_id)
      |> assign(:current_thread_id, thread_id)

  defp activate_run(socket, run_id),
    do:
      socket
      |> assign(:loading, true)
      |> assign(:message_id, run_id)
      |> assign(:message_started, false)
      |> assign(:run_has_started, false)

  defp reset_run(socket),
    do:
      socket
      |> assign(:loading, false)
      |> assign(:message_started, false)
      |> assign(:run_has_started, false)

  defp redact_payload(payload) when is_map(payload),
    do: Map.replace(payload, "access_token", "<REDACTED>")

  defp redact_payload(payload), do: payload
end
