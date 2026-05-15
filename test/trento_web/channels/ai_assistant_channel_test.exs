# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannelTest do
  @moduledoc """
  Channel tests covering:

  - `join/3` — happy path + auth rejections
  - `handle_in/3` for `send_message` payload contract + `new_thread`
  - `handle_info/2` translation of `{:agent, …}` PubSub events into AG-UI
    wire events (the bug-prone surface)
  - `send_message` happy path via Mox doubles for
    `AgenticRuntime.Agents.ServerAdapter` and `SupervisorAdapter`

  The Tier 2 / Tier 3 tests use `:sys.replace_state/2` as a
  test-only escape hatch to seed `socket.assigns` with values that
  would normally be set after a full `execute_agent_with_message/3`
  run. This bypasses the JS-driven assigns chain to exercise the
  individual handlers in isolation.

  Deferred (separate test pass):
    - `:reinit_params, %{conversation_id: id}` happy path with real
      Conversation row
    - `:display_message_saved` / `:display_message_updated` DB paths
  """

  use TrentoWeb.ChannelCase

  import Mox
  import Trento.Factory

  alias TrentoWeb.AIAssistantChannel
  alias TrentoWeb.UserSocket

  alias AgenticRuntime.Agents.ServerAdapter
  alias AgenticRuntime.Agents.SupervisorAdapter

  setup :verify_on_exit!

  describe "join/3" do
    test "joins ai_assistant:<user_id> when current_user_id matches" do
      assert {:ok, _, socket} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42")

      assert socket.assigns.current_scope == %Trento.Users.User{id: 42}
      # init_agent_state defaults
      assert socket.assigns.agent_status == :not_running
      assert socket.assigns.conversation_id == nil
      assert socket.assigns.todos == []
      assert socket.assigns.has_messages == false
      assert socket.assigns.streaming_delta == nil
      assert socket.assigns.loading == false
      assert socket.assigns.messages == []
    end

    test "rejects with :unauthorized when current_user_id does not match topic" do
      assert {:error, :unauthorized} =
               UserSocket
               |> socket("user_id", %{current_user_id: 1})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:2")
    end

    test "rejects with :user_not_logged when current_user_id is absent" do
      assert {:error, :user_not_logged} =
               UserSocket
               |> socket("user_id", %{})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42")
    end
  end

  describe "handle_in send_message/3 — payload contract" do
    setup :join_socket

    test "ignores empty message text", %{socket: socket} do
      ref =
        push(socket, "send_message", %{
          "message" => "",
          "run_id" => "r1",
          "thread_id" => "t1"
        })

      refute_reply(ref, _, 100)
      refute_push("agent_error", _, 100)
    end

    test "ignores whitespace-only message text", %{socket: socket} do
      ref =
        push(socket, "send_message", %{
          "message" => "   \n\t  ",
          "run_id" => "r1",
          "thread_id" => "t1"
        })

      refute_reply(ref, _, 100)
      refute_push("agent_error", _, 100)
    end

    test "rejects payload missing :message", %{socket: socket} do
      ref = push(socket, "send_message", %{"run_id" => "r1", "thread_id" => "t1"})
      assert_reply(ref, :error, :invalid_payload)
    end

    test "rejects payload missing :run_id", %{socket: socket} do
      ref = push(socket, "send_message", %{"message" => "hi", "thread_id" => "t1"})
      assert_reply(ref, :error, :invalid_payload)
    end

    test "rejects payload missing :thread_id", %{socket: socket} do
      ref = push(socket, "send_message", %{"message" => "hi", "run_id" => "r1"})
      assert_reply(ref, :error, :invalid_payload)
    end

    test "drops send while :loading is true (double-send guard)", %{socket: socket} do
      seed_assigns(socket, %{loading: true})

      ref =
        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => "r1",
          "thread_id" => "t1"
        })

      refute_reply(ref, _, 100)
      refute_push("ag_ui_event", _, 100)
    end
  end

  describe "handle_in new_thread/3" do
    setup :join_socket

    test "pushes agent_info confirming the new conversation", %{socket: socket} do
      push(socket, "new_thread", %{})
      assert_push("agent_info", %{message: "New conversation started"})
    end
  end

  describe "handle_info {:reinit_params, ...}" do
    setup :join_socket

    test "is a noop when no conversation context exists", %{socket: socket} do
      send(socket.channel_pid, {:reinit_params, %{}})
      refute_push("ag_ui_event", _, 100)
      refute_push("agent_info", _, 100)
      refute_push("agent_error", _, 100)
    end
  end

  describe "handle_info {:agent, {:status_changed, :running, ...}}" do
    setup :join_socket

    test "flips :agent_status to :running and marks run_has_started",
         %{socket: socket} do
      send(socket.channel_pid, {:agent, {:status_changed, :running, nil}})
      # Allow the GenServer to process the message
      assigns = wait_assigns(socket)

      assert assigns.agent_status == :running
      assert assigns.run_has_started == true
    end
  end

  describe "handle_info {:agent, {:status_changed, :idle, ...}}" do
    setup :join_socket

    test "ignores stale :idle when :run_has_started is false (race guard)",
         %{socket: socket} do
      send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})

      refute_push("ag_ui_event", _, 100)
      assigns = wait_assigns(socket)
      # :run_has_started was never set; the stale :idle leaves state alone
      refute Map.get(assigns, :run_has_started, false)
    end

    test "emits TEXT_MESSAGE_END + RUN_FINISHED when streaming actually started",
         %{socket: socket} do
      seed_assigns(socket, %{
        run_has_started: true,
        message_started: true,
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})

      assert_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_END", "messageId" => "m1"})
      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED", "runId" => "r1", "threadId" => "t1"})
    end

    test "schedules delayed_completion when :idle arrives before streaming started",
         %{socket: socket} do
      seed_assigns(socket, %{
        run_has_started: true,
        message_started: false,
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})

      # Delayed completion fires after 500ms; with no message ever started, it
      # emits RUN_FINISHED but no TEXT_MESSAGE_END
      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED", "runId" => "r1"}, 1500)
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_END"}, 100)
    end
  end

  describe "handle_info {:agent, {:status_changed, :error, ...}}" do
    setup :join_socket

    test "emits RUN_ERROR with formatted last_error_message", %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1"
      })

      send(socket.channel_pid, {:agent, {:status_changed, :error, "boom"}})

      assert_push("ag_ui_event", %{"type" => "RUN_ERROR", "message" => message})
      assert message =~ "boom"
    end
  end

  describe "handle_info {:agent, {:llm_deltas, ...}}" do
    setup :join_socket

    test "first delta emits TEXT_MESSAGE_START + TEXT_MESSAGE_CONTENT",
         %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      send(
        socket.channel_pid,
        {:agent, {:llm_deltas, [%LangChain.MessageDelta{role: :assistant, content: "hello"}]}}
      )

      assert_push("ag_ui_event", %{
        "type" => "TEXT_MESSAGE_START",
        "messageId" => "m1",
        "role" => "assistant"
      })

      assert_push("ag_ui_event", %{
        "type" => "TEXT_MESSAGE_CONTENT",
        "messageId" => "m1",
        "delta" => "hello"
      })

      assigns = wait_assigns(socket)
      assert assigns.message_started == true
    end

    test "subsequent deltas emit only TEXT_MESSAGE_CONTENT", %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1",
        message_started: true
      })

      send(
        socket.channel_pid,
        {:agent, {:llm_deltas, [%LangChain.MessageDelta{role: :assistant, content: "world"}]}}
      )

      assert_push("ag_ui_event", %{
        "type" => "TEXT_MESSAGE_CONTENT",
        "delta" => "world"
      })

      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_START"}, 100)
    end

    test "delta with empty text emits only TEXT_MESSAGE_START (no content)",
         %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      send(
        socket.channel_pid,
        {:agent, {:llm_deltas, [%LangChain.MessageDelta{role: :assistant, content: ""}]}}
      )

      assert_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_START"})
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_CONTENT"}, 100)
    end
  end

  describe "handle_info {:agent, {:tool_call_identified, ...}}" do
    setup :join_socket

    test "emits TOOL_CALL_START + TOOL_CALL_ARGS + TOOL_CALL_END in order",
         %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      tool_info = %{
        call_id: "call-1",
        name: "Host_list",
        display_text: "Listing hosts",
        arguments: %{"q" => "all"}
      }

      send(socket.channel_pid, {:agent, {:tool_call_identified, tool_info}})

      assert_push("ag_ui_event", %{
        "type" => "TOOL_CALL_START",
        "toolCallId" => "call-1",
        "toolCallName" => "Listing hosts",
        "parentMessageId" => "m1"
      })

      assert_push("ag_ui_event", %{
        "type" => "TOOL_CALL_ARGS",
        "toolCallId" => "call-1",
        "delta" => args_json
      })

      assert Jason.decode!(args_json) == %{"q" => "all"}

      assert_push("ag_ui_event", %{"type" => "TOOL_CALL_END", "toolCallId" => "call-1"})
    end

    test "tool_call_name falls back to technical name when display_text is nil",
         %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      tool_info = %{
        call_id: "call-2",
        name: "Cluster_list",
        display_text: nil,
        arguments: %{}
      }

      send(socket.channel_pid, {:agent, {:tool_call_identified, tool_info}})

      assert_push("ag_ui_event", %{
        "type" => "TOOL_CALL_START",
        "toolCallName" => "Cluster_list"
      })
    end
  end

  describe "handle_info {:agent, {:tool_execution_update, ...}}" do
    setup :join_socket

    test "emits TOOL_CALL_RESULT on :completed with result_message_id derived from call_id",
         %{socket: socket} do
      seed_assigns(socket, %{
        current_run_id: "r1",
        current_thread_id: "t1"
      })

      tool_info = %{
        call_id: "call-1",
        name: "Host_list",
        result: %{"hosts" => []}
      }

      send(socket.channel_pid, {:agent, {:tool_execution_update, :completed, tool_info}})

      assert_push("ag_ui_event", %{
        "type" => "TOOL_CALL_RESULT",
        "toolCallId" => "call-1",
        "messageId" => "tool_result_call-1",
        "role" => "tool",
        "content" => content
      })

      assert Jason.decode!(content) == %{"hosts" => []}
    end

    test "no push on :executing", %{socket: socket} do
      seed_assigns(socket, %{current_run_id: "r1", current_thread_id: "t1"})

      tool_info = %{call_id: "call-1", name: "Host_list", display_text: "Listing"}
      send(socket.channel_pid, {:agent, {:tool_execution_update, :executing, tool_info}})

      refute_push("ag_ui_event", _, 100)
    end

    test "no push on :failed", %{socket: socket} do
      seed_assigns(socket, %{current_run_id: "r1", current_thread_id: "t1"})

      tool_info = %{call_id: "call-1", name: "Host_list"}
      send(socket.channel_pid, {:agent, {:tool_execution_update, :failed, tool_info}})

      refute_push("ag_ui_event", _, 100)
    end
  end

  describe "handle_info {:agent, {:agent_shutdown, ...}}" do
    setup :join_socket

    test "clears :agent_id from assigns", %{socket: socket} do
      seed_assigns(socket, %{agent_id: "conversation-abc"})

      shutdown_data = %{
        agent_id: "conversation-abc",
        reason: :inactivity,
        last_activity_at: DateTime.utc_now(),
        shutdown_at: DateTime.utc_now()
      }

      send(socket.channel_pid, {:agent, {:agent_shutdown, shutdown_data}})

      assigns = wait_assigns(socket)
      assert assigns.agent_id == nil
    end
  end

  describe "handle_info {:delayed_completion, ...}" do
    setup :join_socket

    test "emits TEXT_MESSAGE_END + RUN_FINISHED when message_started is true",
         %{socket: socket} do
      seed_assigns(socket, %{message_started: true})

      send(socket.channel_pid, {:delayed_completion, "r1", "t1", "m1"})

      assert_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_END", "messageId" => "m1"})
      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED", "runId" => "r1", "threadId" => "t1"})
    end

    test "emits only RUN_FINISHED when message_started is false (no text was streamed)",
         %{socket: socket} do
      send(socket.channel_pid, {:delayed_completion, "r1", "t1", "m1"})

      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED", "runId" => "r1"})
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_END"}, 100)
    end
  end

  describe "catch-all handle_info" do
    setup :join_socket

    test "swallows unknown :agent events without crash or push", %{socket: socket} do
      send(socket.channel_pid, {:agent, {:novel_event, %{some: "payload"}}})
      refute_push("ag_ui_event", _, 100)
      assert Process.alive?(socket.channel_pid)
    end

    test "swallows arbitrary unrelated messages without crash", %{socket: socket} do
      send(socket.channel_pid, :some_random_message)
      refute_push("ag_ui_event", _, 100)
      assert Process.alive?(socket.channel_pid)
    end
  end

  describe "handle_in send_message/3 — happy path with Mox" do
    setup [:override_agentic_adapters, :join_socket_with_user, :set_mox_from_context]

    test "cold-boot send pushes RUN_STARTED and assigns run/thread/message ids",
         %{socket: socket, run_id: run_id, thread_id: thread_id} do
      mock_cold_boot()

      push(socket, "send_message", %{
        "message" => "hello",
        "run_id" => run_id,
        "thread_id" => thread_id
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_STARTED",
        "runId" => ^run_id,
        "threadId" => ^thread_id
      })

      assigns = wait_assigns(socket)
      assert assigns.loading == true
      assert assigns.current_run_id == run_id
      assert assigns.current_thread_id == thread_id
      assert assigns.message_id == run_id
      assert assigns.message_started == false
      assert assigns.run_has_started == false
    end

    test "warm-path send (agent already running) short-circuits start_agent_sync",
         %{socket: socket, run_id: run_id, thread_id: thread_id} do
      mock_warm_path()

      push(socket, "send_message", %{
        "message" => "hi again",
        "run_id" => run_id,
        "thread_id" => thread_id
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})
      # `verify_on_exit!` confirms `start_agent_sync` was NOT called (no expect)
    end
  end

  # ----------------------------------------------------------------
  # Setup helpers
  # ----------------------------------------------------------------

  defp join_socket(_context) do
    {:ok, _, socket} =
      UserSocket
      |> socket("user_id", %{current_user_id: 7})
      |> subscribe_and_join(AIAssistantChannel, "ai_assistant:7")

    %{socket: socket}
  end

  # Per-test override of the agentic_runtime adapter env so the Mox
  # doubles take effect only for the current test. NOT done globally
  # in test_helper.exs because `Trento.Application` calls
  # `AgenticRuntime.start_runtime([])` at boot — a global override
  # would route that boot-time call through the Mock and crash the
  # supervisor.
  defp override_agentic_adapters(_context) do
    prev_server = Application.get_env(:agentic_runtime, :server_adapter)
    prev_supervisor = Application.get_env(:agentic_runtime, :supervisor_adapter)

    Application.put_env(:agentic_runtime, :server_adapter, ServerAdapter.Mock)
    Application.put_env(:agentic_runtime, :supervisor_adapter, SupervisorAdapter.Mock)

    on_exit(fn ->
      restore_env(:agentic_runtime, :server_adapter, prev_server)
      restore_env(:agentic_runtime, :supervisor_adapter, prev_supervisor)
    end)

    :ok
  end

  defp restore_env(app, key, nil), do: Application.delete_env(app, key)
  defp restore_env(app, key, value), do: Application.put_env(app, key, value)

  defp join_socket_with_user(_context) do
    %{id: user_id} = insert(:user)
    insert(:ai_user_configuration, user_id: user_id, provider: :googleai)

    {:ok, _, socket} =
      UserSocket
      |> socket("user_id", %{current_user_id: user_id})
      |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}")

    %{
      socket: socket,
      user_id: user_id,
      run_id: "r-#{System.unique_integer([:positive])}",
      thread_id: "t-#{System.unique_integer([:positive])}"
    }
  end

  # Mox: cold-boot — agent not running, must call start_agent_sync.
  defp mock_cold_boot do
    test_pid = self()

    expect(ServerAdapter.Mock, :get_pid, fn _agent_id -> nil end)

    expect(SupervisorAdapter.Mock, :start_agent_sync, fn config ->
      send(test_pid, {:supervisor_config, config})
      {:ok, self()}
    end)

    expect(ServerAdapter.Mock, :get_pid, fn _agent_id -> self() end)
    expect(ServerAdapter.Mock, :add_message, fn _agent_id, _message -> :ok end)
  end

  # Mox: warm path — agent already running, no start_agent_sync.
  defp mock_warm_path do
    expect(ServerAdapter.Mock, :get_pid, fn _agent_id -> self() end)
    expect(ServerAdapter.Mock, :add_message, fn _agent_id, _message -> :ok end)
  end

  # Test escape hatch: directly seeds socket.assigns by patching the
  # channel GenServer's state. Bypasses the JS-driven assigns chain so
  # individual handle_info clauses can be exercised in isolation.
  # Phoenix.Channel.Server's state IS the %Phoenix.Socket{} struct.
  defp seed_assigns(socket, attrs) when is_map(attrs) do
    :sys.replace_state(socket.channel_pid, fn channel_socket ->
      %{channel_socket | assigns: Map.merge(channel_socket.assigns, attrs)}
    end)

    :ok
  end

  # Force the channel GenServer to process its mailbox by issuing a
  # synchronous call (any sync call will block until prior async messages
  # are handled). Returns the resulting assigns.
  defp wait_assigns(socket) do
    # `:sys.get_state` synchronizes with the GenServer's mailbox.
    state = :sys.get_state(socket.channel_pid)
    state.assigns
  end
end
