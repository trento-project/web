# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannel do
  @moduledoc """
  Phoenix Channel for the AI Assistant.

  Bridges the React assistant-ui client (AG-UI protocol over WebSocket) to a
  `Sagents.AgentServer` keyed on the JS-supplied `thread_id`. State lives in
  the AgentServer until inactivity timeout
  """

  use TrentoWeb, :channel
  require Logger

  alias LangChain.LangChainError
  alias LangChain.Message
  alias Sagents.{AgentsDynamicSupervisor, AgentServer}

  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.AI.ModelConfig
  alias Trento.Users.User

  alias AgUi.Core.Events.{
    RunError,
    RunFinished,
    RunStarted,
    TextMessageContent,
    TextMessageEnd,
    TextMessageStart,
    ToolCallArgs,
    ToolCallEnd,
    ToolCallResult,
    ToolCallStart
  }

  alias AgUi.Encoder.EventEncoder

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

  def join("ai_assistant:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  @impl true
  def handle_in(
        "send_message",
        %{
          "message" => prompt,
          "run_id" => run_id,
          "thread_id" => thread_id
        },
        socket
      )
      when is_binary(prompt) and is_binary(run_id) and is_binary(thread_id) do
    socket
    |> assign(:current_run_id, run_id)
    |> assign(:current_thread_id, thread_id)
    |> handle_incoming_prompt(String.trim(prompt))
  end

  def handle_in("send_message", payload, socket) do
    Logger.warning("Invalid send_message payload: #{inspect(payload)}")
    {:reply, {:error, :invalid_payload}, socket}
  end

  defp handle_incoming_prompt(%{assigns: %{loading: true}} = socket, _prompt),
    do: {:noreply, socket}

  defp handle_incoming_prompt(socket, ""),
    do: {:noreply, socket}

  defp handle_incoming_prompt(
         %{assigns: %{current_scope: %{id: current_user_id}}} = socket,
         prompt
       ) do
    case ModelConfig.build_user_model_config(current_user_id) do
      {:ok, model_config} ->
        run_agent(socket, model_config, prompt)

      error ->
        emit_run_error(socket, model_setup_error_message(error))
        {:noreply, socket}
    end
  end

  defp model_setup_error_message({:error, :no_ai_configuration}),
    do: "Failed to start agent. No AI configuration found for user."

  defp model_setup_error_message({:error, :unsupported_provider}),
    do: "Failed to start agent. Unsupported AI provider configured."

  defp model_setup_error_message({:error, :user_not_found}),
    do: "Failed to start agent. User not found."

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
        Logger.info("Agent execution started for thread #{thread_id}")

        socket
        |> push_ag_ui_event(%RunStarted{thread_id: thread_id, run_id: run_id})
        |> assign(:loading, true)
        |> assign(:message_id, run_id)
        |> assign(:message_started, false)
        |> assign(:run_has_started, false)
      else
        {:error, reason} ->
          error_msg = "Failed to start agent: #{inspect(reason)}"

          Logger.error(error_msg)

          emit_run_error(socket, error_msg)

          assign(socket, :loading, false)
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
  def handle_info({:agent, {:status_changed, :running, nil}}, socket) do
    Logger.info("Agent is running")
    {:noreply, assign(socket, :run_has_started, true)}
  end

  @impl true
  def handle_info(
        {:agent, {:status_changed, :idle, _data}},
        %{assigns: %{run_has_started: true}} = socket
      ) do
    Logger.info("Agent returned to idle state (execution completed)")

    handle_run_completion(socket)
  end

  def handle_info(
        {:agent, {:status_changed, :idle, _data}},
        %{assigns: %{run_has_started: false}} = socket
      ) do
    Logger.warning("Ignoring stale :idle event - run hasn't started yet")
    {:noreply, socket}
  end

  @impl true
  def handle_info(
        {:delayed_completion, run_id, thread_id, message_id},
        %{assigns: %{run_has_started: true}} = socket
      ) do
    Logger.info("Delayed completion check")

    {:noreply,
     socket
     |> emit_text_message_end(message_id)
     |> emit_run_finished(run_id, thread_id)
     |> assign(:message_started, false)}
  end

  def handle_info(
        {:delayed_completion, run_id, thread_id, _message_id},
        %{assigns: %{run_has_started: false}} = socket
      ) do
    Logger.warning("No message started even after delay - completing run without text message")

    {:noreply, emit_run_finished(socket, run_id, thread_id)}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :error, reason}}, socket) do
    Logger.error("Agent execution failed: #{inspect(reason)}")

    {:noreply,
     socket
     |> assign(:message_started, false)
     |> assign(:loading, false)
     |> emit_run_error(format_error_message(reason))}
  end

  @impl true
  def handle_info({:agent, {:llm_deltas, deltas}}, socket) do
    message_id = socket.assigns.message_id

    delta_text =
      Enum.map_join(deltas, "", fn
        %{content: %{type: :text, content: text}} -> text
        %{content: text} when is_binary(text) -> text
        text when is_binary(text) -> text
        _ -> ""
      end)

    socket =
      if socket.assigns[:message_started] do
        socket
      else
        socket
        |> push_ag_ui_event(%TextMessageStart{message_id: message_id, role: "assistant"})
        |> assign(:message_started, true)
      end

    socket =
      if delta_text != "" do
        push_ag_ui_event(socket, %TextMessageContent{message_id: message_id, delta: delta_text})
      else
        socket
      end

    {:noreply, socket}
  end

  # @impl true
  # def handle_info({:agent, {:llm_message, _message}}, socket) do
  #   # TEXT_MESSAGE_END / RUN_FINISHED are deferred until :idle so they
  #   # arrive AFTER the final :llm_deltas batch is flushed.
  #   {:noreply, socket}
  # end

  # AG-UI tool-call lifecycle is split across 4 wire events per call:
  #
  #   TOOL_CALL_START{tool_call_id, tool_call_name}
  #   TOOL_CALL_ARGS{tool_call_id, delta}        one or more (streaming)
  #   TOOL_CALL_END{tool_call_id}
  #   TOOL_CALL_RESULT{tool_call_id, content}    after execution
  #
  # Sagents collapses streamed argument JSON into a single in-memory map
  # before broadcasting :tool_call_identified, so we synthesize Start +
  # single Args + End back-to-back here. assistant-ui's React runtime
  # doesn't care if Args is 1 chunk or N.
  @impl true
  def handle_info({:agent, {:tool_call_identified, tool_info}}, socket) do
    message_id = socket.assigns.message_id
    tool_call_id = tool_info[:call_id]
    tool_name = tool_info[:name]
    tool_arguments = tool_info[:arguments]
    tool_display_text = tool_info[:display_text]

    tool_call_start = %ToolCallStart{
      tool_call_id: tool_call_id,
      tool_call_name: tool_display_text || tool_name,
      parent_message_id: message_id
    }

    tool_call_args = %ToolCallArgs{
      tool_call_id: tool_call_id,
      delta: Jason.encode!(tool_arguments)
    }

    tool_call_end = %ToolCallEnd{tool_call_id: tool_call_id}

    {:noreply,
     socket
     |> push_ag_ui_event(tool_call_start)
     |> push_ag_ui_event(tool_call_args)
     |> push_ag_ui_event(tool_call_end)}
  end

  @impl true
  def handle_info({:agent, {:tool_execution_update, :completed, tool_info}}, socket) do
    tool_call_id = tool_info[:call_id]
    result = tool_info[:result] || %{}

    {:noreply,
     push_ag_ui_event(socket, %ToolCallResult{
       message_id: "tool_result_#{tool_call_id}",
       tool_call_id: tool_call_id,
       content: Jason.encode!(result),
       role: "tool"
     })}
  end

  @impl true
  def handle_info(_msg, socket) do
    {:noreply, socket}
  end

  defp handle_run_completion(
         %{
           assigns: %{
             message_started: true,
             message_id: message_id,
             current_thread_id: thread_id,
             current_run_id: run_id
           }
         } = socket
       ) do
    {:noreply,
     socket
     |> emit_text_message_end(message_id)
     |> emit_run_finished(run_id, thread_id)
     |> assign(:loading, false)
     |> assign(:message_started, false)
     |> assign(:run_has_started, false)}
  end

  defp handle_run_completion(
         %{
           assigns: %{
             message_id: message_id,
             current_thread_id: thread_id,
             current_run_id: run_id
           }
         } = socket
       ) do
    Logger.warning("Idle arrived before message started - scheduling delayed completion")
    Process.send_after(self(), {:delayed_completion, run_id, thread_id, message_id}, 500)
    {:noreply, assign(socket, :loading, false)}
  end

  defp emit_text_message_end(socket, message_id),
    do: push_ag_ui_event(socket, %TextMessageEnd{message_id: message_id})

  defp emit_run_finished(socket, run_id, thread_id),
    do: push_ag_ui_event(socket, %RunFinished{thread_id: thread_id, run_id: run_id})

  defp emit_run_error(socket, error_message),
    do: push_ag_ui_event(socket, %RunError{message: error_message})

  defp format_error_message(%LangChainError{message: message}),
    do: "Sorry, I encountered an error: #{message}"

  defp format_error_message(reason),
    do: "Sorry, I encountered an error: #{inspect(reason)}"

  defp push_ag_ui_event(socket, event) do
    event
    |> EventEncoder.encode_json()
    |> Jason.decode!()
    |> then(&push(socket, "ag_ui_event", &1))

    socket
  end
end
