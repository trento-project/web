# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannel do
  @moduledoc """
  Phoenix Channel for AI Assistant real-time communication.
  Handles WebSocket connections and AG-UI protocol events.
  """

  use TrentoWeb, :channel
  require Logger

  alias AgenticRuntime.Agents.Coordinator
  alias AgenticRuntime.Conversations
  alias AgenticRuntime.IntegrationHelpers
  alias Trento.Users

  # AG-UI event structs
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

  @system_prompt """
  You are an expert AI assistant for SUSE Trento, a comprehensive solution for SAP applications management and monitoring.
  ## YOUR ROLE
  You help users manage and monitor their SAP HANA and NetWeaver systems through the Trento platform. You provide clear, accurate guidance about:
  - SAP system health and performance
  - HANA cluster monitoring
  - Best practices for SAP on SUSE Linux Enterprise Server
  - Troubleshooting SAP-related issues
  - Interpreting Trento checks and alerts
  ## CORE DIRECTIVES
  ### Context Awareness
  * Always consider the user's current context (cluster, system, or resource being monitored)
  * If context is missing, ask clarifying questions before taking action
  ### Building User Trust
  1. **Reasoning Transparency**: Always explain why you reached a conclusion
  - Good: "The HANA cluster shows 3 failed checks. This indicates potential replication issues."
  - Bad: "The cluster is unhealthy."
  2. **Confidence Indicators**: Express certainty levels clearly
  - High certainty: "This is definitively a configuration issue (95%)"
  - Likely: "This strongly suggests a memory problem (80%)"
  - Possible: "This could be network-related (60%)"
  3. **Graceful Boundaries**
  - If an issue requires SAP expertise: "This requires SAP Basis administrator knowledge. Please consult your SAP team."
  - If off-topic: "I can't help with that, but I can explain how to monitor your HANA clusters."

  ## TOOL USAGE RULES

  1. **Use tool names exactly as defined in the tool schema.** Never combine
     two names into one (e.g. `Host_listCluster_list`) and never invent names
     that aren't in the schema. If you need data from two tools, call them as
     two separate tool calls.
  2. **Always emit a real tool call when you need a tool.** Do not write
     pseudo-code, Python-style invocations, or print statements describing a
     call — use the function-calling mechanism.
  3. **Prefer one tool call per turn for Trento data tools** (Host_list,
     Cluster_list, Sap_system_list, Database_list, *_query_host_prometheus_metrics).
     Wait for the result before deciding the next call.

  Example for "show hosts and their clusters":
  - Step 1: Call `Host_list` → get hosts with `cluster_id`
  - Step 2: Call `Cluster_list` → get cluster details
  - Step 3: Combine results in your response

  ## TOOL USAGE
  * Always use the available tools to query real Trento data
  * If a tool fails, explain the failure and suggest manual steps
  * The runtime may also expose helper tools beyond the Trento data tools
    (planning/todo helpers, documentation retrievers). Use them when they fit
    the user's request — they are part of the schema you receive.
  * When documentation is retrieved, USE IT to answer the user's question -
    don't just acknowledge that docs exist
  * You CAN and SHOULD synthesize detailed explanations from the
    documentation content provided by the retrieval tools
  ## DOCUMENTATION
  * When relevant, provide links to Trento or SUSE documentation
  * Use the documentation retriever tools for accurate information
  ## RESPONSE FORMAT
  * Be concise and clear
  * Provide actionable suggestions
  * Format output in Markdown
  * For system status, summarize first then provide details
  ## BEST PRACTICES
  * Prioritize system health and data integrity
  * Follow SAP and SUSE best practices
  * Consider high-availability requirements
  * Be aware of production system sensitivity
  """

  @impl true
  def join(
        "ai_assistant:" <> user_id,
        _session,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    case allowed?(user_id, current_user_id) do
      true ->
        updated_socket =
          socket
          |> IntegrationHelpers.init_agent_state()
          |> assign(:timezone, "UTC")
          |> assign(:current_scope, %{user: %{id: current_user_id}})

        send(self(), {:reinit_params, %{}})
        {:ok, updated_socket}

      _ ->
        {:error, :unauthorized}
    end
  end

  def join("ai_assistant:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  # Generate a unique run ID for AG UI protocol
  defp generate_run_id do
    Base.encode16(:crypto.strong_rand_bytes(16), case: :lower)
  end

  # Generate a unique tool call ID for AG UI protocol
  defp generate_tool_call_id do
    "tool_" <> Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
  end

  @impl true
  def handle_in("send_message", %{"message" => message_text} = params, socket) do
    message_text = String.trim(message_text)

    if message_text == "" or socket.assigns.loading do
      {:noreply, socket}
    else
      execute_agent_message(socket, message_text, params)
    end
  end

  @impl true
  def handle_in("new_thread", _params, socket) do
    previous_conversation_id = socket.assigns[:conversation_id]

    # Untrack presence BEFORE resetting state so AgentServer
    # sees viewer count drop to 0 and can trigger smart shutdown
    if previous_conversation_id do
      user_id = socket.assigns.current_scope.user.id
      Coordinator.untrack_conversation_viewer(previous_conversation_id, user_id)
    end

    socket = IntegrationHelpers.reset_conversation(socket)

    send(self(), {:reinit_params, %{}})
    push(socket, "agent_info", %{message: "New conversation started"})

    {:noreply, socket}
  end

  # Execute agent message with user input
  defp execute_agent_message(socket, message_text, params) do
    current_user_id = socket.assigns.current_scope.user.id

    {:ok,
     %{
       ai_configuration: %{
         model: model,
         api_key: api_key
       }
     }} = Users.get_user(current_user_id)

    # Store run_id for tracking this execution (generate if not provided)
    run_id = params["run_id"] || generate_run_id()
    thread_id = params["thread_id"]

    # Create conversation if this is the first message
    socket =
      case socket.assigns.conversation_id do
        nil -> create_new_conversation(socket, message_text)
        _id -> socket
      end

    conversation_id = socket.assigns.conversation_id
    model_config = AgenticRuntime.build_googleai_model_config(model, api_key)

    start_agent_session_and_execute(
      socket,
      conversation_id,
      model_config,
      message_text,
      run_id,
      thread_id
    )
  end

  # Start agent session and execute message
  defp start_agent_session_and_execute(
         socket,
         conversation_id,
         model_config,
         message_text,
         run_id,
         thread_id
       ) do
    case Coordinator.start_conversation_session(conversation_id,
           filesystem_scope: nil,
           scope: socket.assigns.current_scope,
           tool_context: %{timezone: socket.assigns.timezone},
           factory_opts: [
             model_config: model_config,
             base_system_prompt: @system_prompt,
             tools: TrentoWeb.AIAssistantTools.tools()
           ]
         ) do
      {:ok, session} ->
        execute_agent_with_message(socket, session, message_text, run_id, thread_id)

      {:error, reason} ->
        Logger.error("Failed to ensure agent running: #{inspect(reason)}")

        push(socket, "agent_error", %{
          message: "Failed to start agent session: #{inspect(reason)}"
        })

        {:noreply, socket}
    end
  end

  # Execute agent with user message
  defp execute_agent_with_message(socket, session, message_text, run_id, thread_id) do
    langchain_message = AgenticRuntime.build_new_user_message!(message_text)

    case AgenticRuntime.add_message(session.agent_id, langchain_message) do
      :ok ->
        Logger.info("Agent execution started")

        # Emit AG UI RunStarted event
        push_ag_ui_event(socket, %RunStarted{
          thread_id: thread_id,
          run_id: run_id
        })

        {:noreply,
         socket
         |> assign(:input, "")
         |> assign(:loading, true)
         |> assign(:current_run_id, run_id)
         |> assign(:current_thread_id, thread_id)
         |> assign(:message_id, run_id)
         |> assign(:message_started, false)
         |> assign(:run_has_started, false)}

      {:error, reason} ->
        Logger.error("Failed to execute agent: #{inspect(reason)}")

        push(socket, "agent_error", %{message: "Failed to start agent #{inspect(reason)}"})

        {:noreply, assign(socket, :loading, false)}
    end
  end

  @impl true
  def handle_info({:reinit_params, params}, socket) do
    conversation_id = params[:conversation_id]
    previous_conversation_id = socket.assigns.conversation_id

    socket =
      cond do
        conversation_id && conversation_id != previous_conversation_id ->
          if previous_conversation_id do
            user_id = socket.assigns.current_scope.user.id
            Coordinator.untrack_conversation_viewer(previous_conversation_id, user_id)
            Logger.debug("Untracked presence from conversation #{previous_conversation_id}")
          end

          load_conversation(socket, conversation_id)

        is_nil(conversation_id) && previous_conversation_id ->
          user_id = socket.assigns.current_scope.user.id
          Coordinator.untrack_conversation_viewer(previous_conversation_id, user_id)
          Logger.debug("Untracked presence from conversation #{previous_conversation_id}")

          IntegrationHelpers.reset_conversation(socket)

        true ->
          socket
      end

    {:noreply, socket}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :running, nil}}, socket) do
    Logger.info("Agent is running")

    # Mark that this run has started running
    # This helps us ignore stale :idle events
    {:noreply,
     socket
     |> IntegrationHelpers.handle_status_running()
     |> assign(:run_has_started, true)}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :idle, _data}}, socket) do
    Logger.info("Agent returned to idle state (execution completed)")

    # Ignore stale :idle events that arrive before :running
    run_has_started = socket.assigns[:run_has_started] || false

    if run_has_started do
      handle_idle_with_started_run(socket)
    else
      Logger.warning("Ignoring stale :idle event - run hasn't started yet")
      {:noreply, socket}
    end
  end

  @impl true
  def handle_info({:delayed_completion, run_id, thread_id, message_id}, socket) do
    Logger.info("Delayed completion check")

    # Check if message has started now
    message_started = socket.assigns[:message_started] || false

    socket =
      if message_started do
        # Emit completion events now
        socket = emit_text_message_end_if_present(socket, message_id, run_id, thread_id)
        emit_run_finished_if_present(socket, run_id, thread_id)
        assign(socket, :message_started, false)
      else
        # Still no message - emit RUN_FINISHED without TEXT_MESSAGE_END
        Logger.warning(
          "No message started even after delay - completing run without text message"
        )

        emit_run_finished_if_present(socket, run_id, thread_id)
      end

    {:noreply, socket}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :cancelled, _data}}, socket) do
    Logger.info("Agent execution was cancelled")
    updated_socket = IntegrationHelpers.handle_status_cancelled(socket)
    push(updated_socket, "agent-execution-cancelled", %{})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :error, reason}}, socket) do
    Logger.error("Agent execution failed: #{inspect(reason)}")

    run_id = socket.assigns[:current_run_id]
    thread_id = socket.assigns[:current_thread_id]

    socket =
      socket
      |> IntegrationHelpers.handle_status_error(reason)
      |> assign(:message_started, false)

    push_ag_ui_event_with_ids(
      socket,
      %RunError{message: socket.assigns.last_error_message},
      run_id,
      thread_id
    )

    {:noreply, socket}
  end

  @impl true
  def handle_info({:agent, {:status_changed, :interrupted, interrupt_data}}, socket) do
    Logger.warning(
      "Agent execution interrupted but no interrupt UI is wired: #{inspect(interrupt_data)}"
    )

    run_id = socket.assigns[:current_run_id]
    thread_id = socket.assigns[:current_thread_id]

    push_ag_ui_event_with_ids(
      socket,
      %RunError{
        message: "Agent paused waiting for human input, but this UI does not support interrupts."
      },
      run_id,
      thread_id
    )

    {:noreply, IntegrationHelpers.handle_status_interrupted(socket, interrupt_data)}
  end

  @impl true
  def handle_info({:agent, {:llm_deltas, deltas}}, socket) do
    updated_socket = IntegrationHelpers.handle_llm_deltas(socket, deltas)

    run_id = socket.assigns[:current_run_id]
    thread_id = socket.assigns[:current_thread_id]
    message_id = socket.assigns[:message_id]
    message_started = socket.assigns[:message_started] || false

    # Extract text content from LangChain.MessageDelta structs
    delta_text =
      case deltas do
        deltas when is_binary(deltas) ->
          deltas

        deltas when is_list(deltas) ->
          Enum.map_join(deltas, "", fn
            # LangChain.MessageDelta with ContentPart
            %{content: %{type: :text, content: text}} -> text
            # LangChain.MessageDelta with string content
            %{content: text} when is_binary(text) -> text
            # Plain string
            text when is_binary(text) -> text
            # Fallback
            _ -> ""
          end)

        _ ->
          ""
      end

    # Emit TextMessageStart on first delta
    updated_socket =
      if message_started do
        updated_socket
      else
        event = %TextMessageStart{
          message_id: message_id,
          role: "assistant"
        }

        push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)
        assign(updated_socket, :message_started, true)
      end

    # Emit TextMessageContent for the delta (only if there's actual text)
    if delta_text != "" do
      event = %TextMessageContent{
        message_id: message_id,
        delta: delta_text
      }

      push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)
    end

    {:noreply, updated_socket}
  end

  @impl true
  def handle_info({:agent, {:llm_message, _message}}, socket) do
    # The llm_message event can arrive before or during llm_deltas streaming.
    # Defer TEXT_MESSAGE_END / RUN_FINISHED until status changes to :idle.
    {:noreply, IntegrationHelpers.handle_llm_message_complete(socket)}
  end

  @impl true
  def handle_info({:agent, {:display_message_saved, display_msg}}, socket) do
    updated_socket = IntegrationHelpers.handle_display_message_saved(socket, display_msg)

    {:noreply, updated_socket}
  end

  @impl true
  def handle_info({:agent, {:llm_token_usage, usage}}, socket) do
    # Optional: Display token usage stats
    Logger.debug("Token usage: #{inspect(usage)}")
    {:noreply, socket}
  end

  @impl true
  def handle_info({:agent, {:conversation_title_generated, new_title, agent_id}}, socket) do
    Logger.info("Conversation title generated: #{new_title}")

    {:noreply,
     IntegrationHelpers.handle_conversation_title_generated(socket, new_title, agent_id)}
  end

  @impl true
  def handle_info({:agent, {:agent_shutdown, shutdown_data}}, socket) do
    {:noreply, IntegrationHelpers.handle_agent_shutdown(socket, shutdown_data)}
  end

  @impl true
  def handle_info({:agent, {:tool_call_identified, tool_info}}, socket) do
    updated_socket = IntegrationHelpers.handle_tool_call_identified(socket, tool_info)

    # Emit AG UI protocol events for tool call
    run_id = socket.assigns[:current_run_id]
    thread_id = socket.assigns[:current_thread_id]
    message_id = socket.assigns[:message_id]
    tool_name = tool_info[:name] || tool_info["name"]
    tool_arguments = tool_info[:arguments] || tool_info["arguments"]

    # Get the tool_call_id from tool_info (use call_id, not id)
    tool_call_id = tool_info[:call_id] || tool_info["call_id"] || generate_tool_call_id()

    # Store tool_call_id mapping for later use (e.g., tool results)
    tool_call_ids = socket.assigns[:tool_call_ids] || %{}

    updated_socket =
      assign(updated_socket, :tool_call_ids, Map.put(tool_call_ids, tool_name, tool_call_id))

    # ToolCallStart (with runId and threadId)
    event = %ToolCallStart{
      tool_call_id: tool_call_id,
      tool_call_name: tool_name,
      parent_message_id: message_id
    }

    push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)

    # ToolCallArgs with JSON-encoded arguments (with runId and threadId)
    args_json = Jason.encode!(tool_arguments)

    event = %ToolCallArgs{
      tool_call_id: tool_call_id,
      delta: args_json
    }

    push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)

    # ToolCallEnd (with runId and threadId)
    event = %ToolCallEnd{
      tool_call_id: tool_call_id
    }

    push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)

    {:noreply, updated_socket}
  end

  @impl true
  def handle_info({:agent, {:tool_execution_update, status, tool_info}}, socket) do
    updated_socket = IntegrationHelpers.handle_tool_execution_update(socket, status, tool_info)

    # Emit AG UI ToolCallResult event when execution completes
    if status == :completed do
      run_id = socket.assigns[:current_run_id]
      thread_id = socket.assigns[:current_thread_id]
      tool_name = tool_info[:name] || tool_info["name"]

      # Get the tool_call_id (use call_id from tool_info or the stored mapping)
      tool_call_ids = socket.assigns[:tool_call_ids] || %{}

      tool_call_id =
        tool_info[:call_id] || tool_info["call_id"] || tool_call_ids[tool_name] ||
          generate_tool_call_id()

      result = tool_info[:result] || tool_info["result"] || %{}

      # Generate a message ID for the tool result
      result_message_id = "tool_result_#{tool_call_id}"

      # Encode result as JSON string
      result_json = Jason.encode!(result)

      event = %ToolCallResult{
        message_id: result_message_id,
        tool_call_id: tool_call_id,
        content: result_json,
        role: "tool"
      }

      push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)
    end

    {:noreply, updated_socket}
  end

  @impl true
  def handle_info({:agent, {:display_message_updated, updated_msg}}, socket) do
    updated_socket = IntegrationHelpers.handle_display_message_updated(socket, updated_msg)
    {:noreply, updated_socket}
  end

  @impl true
  def handle_info(_msg, socket) do
    # Ignore unknown messages
    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, _socket) do
    # PubSub subscriptions and Presence tracking are auto-cleaned when the
    # channel process exits. The agent itself shuts down on presence empty
    # or inactivity timeout, so no Coordinator.stop_conversation_session/1 here.
    :ok
  end

  # Handle idle status when run has started
  defp handle_idle_with_started_run(socket) do
    # Emit TEXT_MESSAGE_END and RUN_FINISHED when agent completes
    # But ONLY if we've started streaming (message_started = true)
    # This prevents race conditions where :idle arrives before :llm_deltas
    message_id = socket.assigns[:message_id]
    run_id = socket.assigns[:current_run_id]
    thread_id = socket.assigns[:current_thread_id]
    message_started = socket.assigns[:message_started] || false

    Logger.info("Idle handler - message_started: #{message_started}")

    # Only emit completion events if streaming actually started
    updated_socket =
      if message_started do
        socket
        |> emit_text_message_end_if_present(message_id, run_id, thread_id)
        |> emit_run_finished_if_present(run_id, thread_id)
        |> IntegrationHelpers.handle_status_idle()
        |> assign(:message_started, false)
        |> assign(:run_has_started, false)
      else
        # Message hasn't started streaming yet - :idle came too early
        # Schedule a delayed check to emit completion events
        Logger.warning("Idle arrived before message started - scheduling delayed completion")
        Process.send_after(self(), {:delayed_completion, run_id, thread_id, message_id}, 500)
        IntegrationHelpers.handle_status_idle(socket)
      end

    {:noreply, updated_socket}
  end

  # Helper to emit TextMessageEnd if message_id is present
  defp emit_text_message_end_if_present(socket, message_id, run_id, thread_id) do
    if message_id do
      event = %TextMessageEnd{message_id: message_id}
      push_ag_ui_event_with_ids(socket, event, run_id, thread_id)
    end

    socket
  end

  # Helper to emit RunFinished if run_id and thread_id are present
  defp emit_run_finished_if_present(socket, run_id, thread_id) do
    if run_id && thread_id do
      push_ag_ui_event(socket, %RunFinished{
        thread_id: thread_id,
        run_id: run_id
      })
    end

    socket
  end

  defp load_conversation(socket, conversation_id) do
    scope = socket.assigns.current_scope
    user_id = socket.assigns.current_scope.user.id

    case IntegrationHelpers.load_conversation(socket, conversation_id,
           scope: scope,
           user_id: user_id
         ) do
      {:ok, socket} ->
        socket

      {:error, :not_found, socket} ->
        push(socket, "conversation_not_found", %{conversation_id: conversation_id})
        send(self(), {:reinit_params, %{}})
        socket
    end
  end

  defp create_new_conversation(socket, first_message_text) do
    scope = socket.assigns.current_scope

    # Generate title from first message (truncate at 60 chars)
    title = String.slice(first_message_text, 0, 60)

    case Conversations.create_conversation(scope, %{
           title: title,
           metadata: %{"version" => 1}
         }) do
      {:ok, conversation} ->
        Logger.info("Created new conversation: #{conversation.id}")

        agent_id = Coordinator.conversation_agent_id(conversation.id)

        # Subscribe to agent events (works even if agent not running!)
        # Using ensure_* versions - idempotent, safe to call multiple times
        :ok = Coordinator.ensure_subscribed_to_conversation(conversation.id)
        Logger.debug("Ensured subscription to agent events for conversation #{conversation.id}")

        # Track presence - this enables smart agent shutdown
        user_id = socket.assigns.current_scope.user.id
        {:ok, _ref} = Coordinator.track_conversation_viewer(conversation.id, user_id)
        Logger.debug("Tracking presence for conversation #{conversation.id}, user #{user_id}")

        socket =
          socket
          |> assign(:conversation, conversation)
          |> assign(:conversation_id, conversation.id)
          |> assign(:agent_id, agent_id)

        send(self(), {:reinit_params, %{conversation_id: conversation.id}})
        socket

      {:error, changeset} ->
        Logger.error("Failed to create conversation: #{inspect(changeset)}")

        push(socket, "agent_error", %{message: "Failed to create conversation"})
        socket
    end
  end

  # Helper to push AG-UI protocol events to the client
  # Encodes the event to JSON with camelCase keys (AG-UI protocol standard)
  defp push_ag_ui_event(socket, event) do
    # Encode event to JSON map with camelCase keys
    # The type field stays in SCREAMING_SNAKE_CASE (e.g., "RUN_STARTED")
    event_json =
      event
      |> Map.from_struct()
      |> Enum.reject(fn {_k, v} -> is_nil(v) end)
      |> Enum.map(fn {k, v} -> {to_camel_case(k), v} end)
      |> Map.new()

    push(socket, "ag_ui_event", event_json)
    socket
  end

  # Helper to push AG-UI events with runId and threadId added.
  # Some events don't include these fields by default, but the client needs them.
  defp push_ag_ui_event_with_ids(socket, event, run_id, thread_id) do
    event_json =
      event
      |> Map.from_struct()
      |> Enum.reject(fn {_k, v} -> is_nil(v) end)
      |> Enum.map(fn {k, v} -> {to_camel_case(k), v} end)
      |> Map.new()
      |> Map.put("runId", run_id)
      |> Map.put("threadId", thread_id)

    push(socket, "ag_ui_event", event_json)
    socket
  end

  # Convert atom or string from snake_case to camelCase
  defp to_camel_case(atom) when is_atom(atom) do
    atom
    |> Atom.to_string()
    |> to_camel_case()
  end

  defp to_camel_case(string) when is_binary(string) do
    [first | rest] = String.split(string, "_")
    first <> Enum.map_join(rest, "", &String.capitalize/1)
  end
end

require Protocol
Protocol.derive(Jason.Encoder, LangChain.MessageDelta)
Protocol.derive(Jason.Encoder, LangChain.TokenUsage)
Protocol.derive(Jason.Encoder, LangChain.Message.ToolCall)

defimpl AgenticRuntime.Scope, for: Map do
  def owner_id(%{user: %{id: id}}), do: id
end
