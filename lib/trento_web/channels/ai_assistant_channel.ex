defmodule TrentoWeb.AIAssistantChannel do
  use TrentoWeb, :channel
  require Logger

  alias AgenticRuntime.Conversations
  alias AgenticRuntime.Agents.Coordinator
  alias AgenticRuntime.IntegrationHelpers
  alias Trento.Users

  # AG-UI event structs
  alias AgUi.Core.Events.{
    RunStarted,
    RunFinished,
    RunError,
    TextMessageStart,
    TextMessageContent,
    TextMessageEnd,
    ToolCallStart,
    ToolCallArgs,
    ToolCallEnd,
    ToolCallResult
  }
  alias AgUi.Encoder.EventEncoder

  @impl true
  def join("ai_assistant:" <> user_id, session, %{assigns: %{current_user_id: current_user_id}} = socket) do

    # IO.inspect("User #{user_id} joined AI Assistant channel")
    # IO.inspect("Current socket: #{inspect(socket)}")
    # IO.inspect("Session data: #{inspect(session)}")

    # current_user_id = socket.assigns.current_scope.user.id

    case allowed?(user_id, current_user_id) do
      # For new conversations, agent_id will be set when conversation is created
      true ->
        updated_socket =
          socket
          |> IntegrationHelpers.init_agent_state()
          |> assign(:page_title, "Agents Demo")
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
    :crypto.strong_rand_bytes(16) |> Base.encode16(case: :lower)
  end

  @impl true
  def handle_in("send_message", %{"message" => message_text} = params, socket) do
    message_text = String.trim(message_text)
    current_user_id = socket.assigns.current_scope.user.id
    {:ok, %{ai_configuration: %{
      model: model,
      api_key: api_key
    }}} = user = Users.get_user(current_user_id)

    IO.inspect(user, label: "Current user")

    IO.inspect(model, label: "Current model")
    IO.inspect(api_key, label: "Current API key")

    # Store run_id for tracking this execution (generate if not provided)
    run_id = params["run_id"] || generate_run_id()
    thread_id = params["thread_id"]

    if message_text == "" or socket.assigns.loading do
      {:noreply, socket}
    else
      # Create conversation if this is the first message
      socket =
        case socket.assigns.conversation_id do
          nil ->
            create_new_conversation(socket, message_text)

          _id ->
            socket
        end

      conversation_id = socket.assigns.conversation_id
      filesystem_scope = nil
      timezone = socket.assigns.timezone

      model_config =
        AgenticRuntime.build_googleai_model_config(
          model,
          api_key
        )

      base_system_prompt = "You are helpful AI assistant."
      # Ensure agent is running
      # Coordinator.start_conversation_session is idempotent
      case Coordinator.start_conversation_session(conversation_id,
             filesystem_scope: filesystem_scope,
             user_scope: socket.assigns.current_scope,
             timezone: timezone,
             factory_opts: [
               model_config: model_config,
               base_system_prompt: base_system_prompt,
               tools: TrentoWeb.AIAssistantTools.tools()
             ]
           ) do
        {:ok, session} ->
          langchain_message = AgenticRuntime.build_new_user_message!(message_text)

          # Add message to AgenticRuntime (will save and broadcast via PubSub)
          # (Subscription already active from load_conversation)
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

            # Display happens when we receive {:display_message_saved, msg} event
            {:error, reason} ->
              Logger.error("Failed to execute agent: #{inspect(reason)}")

              {:noreply,
               socket
               |> assign(:loading, false)
               |> assign(:put_flash, "Error: Failed to start agent #{inspect(reason)}")}
          end

        {:error, reason} ->
          Logger.error("Failed to ensure agent running: #{inspect(reason)}")

          {:noreply,
           socket
           |> assign(:put_flash, "Error: Failed to start agent session: #{inspect(reason)}")}
      end
    end
  end

  @impl true
  def handle_in("cancel_agent", _params, socket) do
    Logger.info("User requested to cancel agent execution")

    case AgenticRuntime.cancel_agent_execution(socket.assigns.agent_id) do
      :ok ->
        # The cancellation message will be created when we receive the
        # {:status_changed, :cancelled, nil} event from AgentServer
        {:noreply, socket}

      {:error, reason} ->
        Logger.error("Failed to cancel agent: #{inspect(reason)}")

        {:noreply,
         assign(socket, :put_flash, "Error: Failed to cancel agent: #{inspect(reason)}")}
    end
  end

  @impl true
  def handle_in("update_input", %{"message" => message}, socket) do
    {:noreply, assign(socket, :input, message)}
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

    socket =
      socket
      |> IntegrationHelpers.reset_conversation()
      |> assign(:page_title, "Agents Demo")
      |> assign(:selected_sub_agent, nil)
      |> reset_conversation_in_stream(previous_conversation_id)

    send(self(), {:reinit_params, %{}})

    {:noreply,
     socket
     |> assign(:put_flash, "Info: New conversation started")}
  end

  @impl true
  def handle_info({:reinit_params, params}, socket) do
    IO.inspect("reinit_params")
    conversation_id = params[:conversation_id]
    previous_conversation_id = socket.assigns.conversation_id

    socket =
      cond do
        # Load conversation if conversation_id is present and different from current
        conversation_id && conversation_id != previous_conversation_id ->
          # Untrack presence from previous conversation if connected
          if previous_conversation_id do
            user_id = socket.assigns.current_scope.user.id
            Coordinator.untrack_conversation_viewer(previous_conversation_id, user_id)
            Logger.debug("Untracked presence from conversation #{previous_conversation_id}")
          end

          socket
          |> load_conversation(conversation_id)
          |> update_conversation_selection(previous_conversation_id, conversation_id)

        # If no conversation_id in params, reset to fresh state
        is_nil(conversation_id) && previous_conversation_id ->
          # Untrack presence when going back to empty state
          # if connected?(socket)do
          user_id = socket.assigns.current_scope.user.id
          Coordinator.untrack_conversation_viewer(previous_conversation_id, user_id)
          Logger.debug("Untracked presence from conversation #{previous_conversation_id}")
          # end

          reset_conversation_state(socket)

        # No change needed
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
  def handle_info({:agent, {:status_changed, :idle, data}}, socket) do
    Logger.info("Agent returned to idle state (execution completed)")

    IO.inspect(data, label: "Idle status data")

    # Ignore stale :idle events that arrive before :running
    run_has_started = socket.assigns[:run_has_started] || false

    if !run_has_started do
      Logger.warning("Ignoring stale :idle event - run hasn't started yet")
      {:noreply, socket}
    else
      # Emit TEXT_MESSAGE_END and RUN_FINISHED when agent completes
      # But ONLY if we've started streaming (message_started = true)
      # This prevents race conditions where :idle arrives before :llm_deltas
      message_id = socket.assigns[:message_id]
      run_id = socket.assigns[:current_run_id]
      thread_id = socket.assigns[:current_thread_id]
      message_started = socket.assigns[:message_started] || false

      Logger.info("Idle handler - message_started: #{message_started}")

      # Only emit completion events if streaming actually started
      if message_started do
        # Emit TEXT_MESSAGE_END (with runId and threadId)
        if message_id do
          event = %TextMessageEnd{message_id: message_id}
          push_ag_ui_event_with_ids(socket, event, run_id, thread_id)
        end

        # Emit RUN_FINISHED (already has runId and threadId in the struct)
        if run_id && thread_id do
          push_ag_ui_event(socket, %RunFinished{
            thread_id: thread_id,
            run_id: run_id
          })
        end

        {:noreply,
         socket
         |> IntegrationHelpers.handle_status_idle()
         |> assign(:message_started, false)
         |> assign(:run_has_started, false)}
      else
        # Message hasn't started streaming yet - :idle came too early
        # Schedule a delayed check to emit completion events
        Logger.warning("Idle arrived before message started - scheduling delayed completion")
        Process.send_after(self(), {:delayed_completion, run_id, thread_id, message_id}, 500)

        {:noreply, IntegrationHelpers.handle_status_idle(socket)}
      end
    end
  end

  @impl true
  def handle_info({:delayed_completion, run_id, thread_id, message_id}, socket) do
    Logger.info("Delayed completion check")

    # Check if message has started now
    message_started = socket.assigns[:message_started] || false

    if message_started do
      # Emit completion events now
      if message_id do
        event = %TextMessageEnd{message_id: message_id}
        push_ag_ui_event_with_ids(socket, event, run_id, thread_id)
      end

      if run_id && thread_id do
        push_ag_ui_event(socket, %RunFinished{
          thread_id: thread_id,
          run_id: run_id
        })
      end

      {:noreply, assign(socket, :message_started, false)}
    else
      # Still no message - emit RUN_FINISHED without TEXT_MESSAGE_END
      Logger.warning("No message started even after delay - completing run without text message")

      if run_id && thread_id do
        push_ag_ui_event(socket, %RunFinished{
          thread_id: thread_id,
          run_id: run_id
        })
      end

      {:noreply, socket}
    end
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

    # Emit AG UI RunError event (with runId and threadId)
    event = %RunError{
      message: inspect(reason)
    }
    push_ag_ui_event_with_ids(socket, event, run_id, thread_id)

    {:noreply,
     socket
     |> IntegrationHelpers.handle_status_error(reason)
     |> assign(:message_started, false)}
  end

  @impl true
  def handle_info({:agent, {:llm_deltas, deltas}}, socket) do
    IO.inspect(deltas, label: "Received LLM deltas")
    updated_socket = IntegrationHelpers.handle_llm_deltas(socket, deltas)

    run_id = socket.assigns[:current_run_id]
    thread_id = socket.assigns[:current_thread_id]
    message_id = socket.assigns[:message_id]
    message_started = socket.assigns[:message_started] || false

    # Extract text content from LangChain.MessageDelta structs
    delta_text = case deltas do
      deltas when is_binary(deltas) ->
        deltas

      deltas when is_list(deltas) ->
        deltas
        |> Enum.map(fn
          # LangChain.MessageDelta with ContentPart
          %{content: %{type: :text, content: text}} -> text
          # LangChain.MessageDelta with string content
          %{content: text} when is_binary(text) -> text
          # Plain string
          text when is_binary(text) -> text
          # Fallback
          _ -> ""
        end)
        |> Enum.join("")

      _ ->
        ""
    end

    IO.inspect(delta_text, label: "Extracted delta text")

    # Emit TextMessageStart on first delta
    updated_socket = if !message_started do
      # Add runId and threadId to the event
      event = %TextMessageStart{
        message_id: message_id,
        role: "assistant"
      }
      push_ag_ui_event_with_ids(updated_socket, event, run_id, thread_id)
      assign(updated_socket, :message_started, true)
    else
      updated_socket
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
  def handle_info({:agent, {:llm_message, message}}, socket) do
    IO.inspect(message, label: "LLM message content")

    # Don't emit AG-UI events here!
    # The llm_message event can arrive before or during llm_deltas streaming
    # We'll emit TEXT_MESSAGE_END and RUN_FINISHED when status changes to :idle

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

    # Build page title from new title
    page_title =
      if String.length(new_title) > 60 do
        truncated = String.slice(new_title, 0, 60)
        "#{truncated}... - Agents Demo"
      else
        "#{new_title} - Agents Demo"
      end

    socket =
      socket
      |> IntegrationHelpers.handle_conversation_title_generated(new_title, agent_id)
      |> assign(:page_title, page_title)

    {:noreply, socket}
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
    tool_call_id = tool_info[:id] || tool_info["id"]
    tool_name = tool_info[:name] || tool_info["name"]
    tool_arguments = tool_info[:arguments] || tool_info["arguments"]

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
    if status == :complete do
      run_id = socket.assigns[:current_run_id]
      thread_id = socket.assigns[:current_thread_id]
      tool_call_id = tool_info[:id] || tool_info["id"]
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
    # PubSub subscriptions and Presence tracking are automatically cleaned up
    # when the LiveView process terminates - no manual cleanup needed

    # Note: We don't call Coordinator.stop_conversation_session/1 here
    # because other tabs/users might still be using the conversation.
    # The agent will shutdown based on:
    # 1. Presence tracking (if idle with no viewers)
    # 2. Inactivity timeout (10 minutes by default, as fallback)

    :ok
  end

  # # Load conversation from database using helper
  defp load_conversation(socket, conversation_id) do
    scope = socket.assigns.current_scope
    user_id = socket.assigns.current_scope.user.id

    case IntegrationHelpers.load_conversation(socket, conversation_id,
           scope: scope,
           user_id: user_id
         ) do
      {:ok, socket} ->
        # Build page title from conversation title
        page_title = build_page_title(socket.assigns.conversation)

        socket
        |> assign(:page_title, page_title)

      {:error, socket} ->
        # Conversation not found - navigate to fresh state
        send(self(), {:reinit_params, %{}})
        socket
    end
  end

  # Build page title from conversation (application-specific formatting)
  defp build_page_title(conversation) do
    if conversation.title && conversation.title != "" do
      # Truncate long titles for page title
      truncated_title = String.slice(conversation.title, 0, 60)

      if String.length(conversation.title) > 60 do
        "#{truncated_title}... - Agents Demo"
      else
        "#{truncated_title} - Agents Demo"
      end
    else
      "Conversation - Agents Demo"
    end
  end

  # Reset to fresh conversation state using helper
  defp reset_conversation_state(socket) do
    socket
    |> IntegrationHelpers.reset_conversation()
    |> assign(:page_title, "Agents Demo")
  end

  # Update conversation selection in the stream to reflect active state
  # This re-inserts both the previous and new conversation items so they re-render
  # with the updated @conversation_id assign, updating the active styling
  defp update_conversation_selection(socket, previous_id, new_id) do
    socket
    |> reset_conversation_in_stream(previous_id)
    |> reset_conversation_in_stream(new_id)
  end

  # Re-insert a conversation into the stream to trigger re-render with updated active state
  # Used when switching conversations or starting a new thread
  defp reset_conversation_in_stream(socket, nil), do: socket

  defp reset_conversation_in_stream(socket, conversation_id) do
    if socket.assigns.is_thread_history_open do
      scope = socket.assigns.current_scope

      case Conversations.get_conversation(scope, conversation_id) do
        {:ok, conversation} ->
          assign(socket, :conversation_list, conversation)

        {:error, :not_found} ->
          socket
      end
    else
      socket
    end
  end

  # Create new conversation in database
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
          |> assign(:page_title, "New Conversation - Agents Demo")

        send(self(), {:reinit_params, %{conversation_id: conversation.id}})
        socket

      {:error, changeset} ->
        Logger.error("Failed to create conversation: #{inspect(changeset)}")

        socket
        |> assign(:put_flash, "Error: Failed to create conversation")
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

    # Log for debugging
    IO.inspect(event_json, label: "🔷 Pushing AG-UI event")

    # Push as a single "ag_ui_event" that the client listens to
    # The client will route based on the type field
    push(socket, "ag_ui_event", event_json)
    socket
  end

  # Helper to push AG-UI events with runId and threadId added
  # Some events don't include these fields by default, but the client needs them
  defp push_ag_ui_event_with_ids(socket, event, run_id, thread_id) do
    # Encode event to JSON map with camelCase keys
    event_json =
      event
      |> Map.from_struct()
      |> Enum.reject(fn {_k, v} -> is_nil(v) end)
      |> Enum.map(fn {k, v} -> {to_camel_case(k), v} end)
      |> Map.new()
      # Add runId and threadId to every event
      |> Map.put("runId", run_id)
      |> Map.put("threadId", thread_id)

    # Log for debugging
    IO.inspect(event_json, label: "🔷 Pushing AG-UI event (with IDs)")

    # Push as a single "ag_ui_event" that the client listens to
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
