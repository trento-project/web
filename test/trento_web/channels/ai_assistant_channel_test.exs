# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannelTest do
  @moduledoc """
  Channel tests covering:

  - `join/3` — happy path + auth rejections
  - `handle_in/3` for `send_message` payload contract + `new_thread`
  - `handle_info/2` translation of `{:agent, …}` PubSub events into AG-UI
    wire events (the bug-prone surface)

  The `handle_info` tests use `:sys.replace_state/2` as a test-only
  escape hatch to seed `socket.assigns` with values that would normally
  be set after a full `send_message` round-trip. This bypasses the
  JS-driven assigns chain to exercise the individual handlers in
  isolation.

  Happy-path `send_message` coverage uses Mox doubles for the sagents
  adapter boundary (`Trento.AI.Agent.{Server, Supervisor}`,
  routed via `config/test.exs`). See
  `describe "handle_in send_message/3 — happy path"`.
  """

  use TrentoWeb.ChannelCase
  use Trento.AI.AICase

  import Mox
  import Trento.Factory

  alias TrentoWeb.AIAssistantChannel
  alias TrentoWeb.UserSocket

  setup :verify_on_exit!

  describe "join/3" do
    test "joins ai_assistant:<user_id> when current_user_id matches" do
      assert {:ok, _, socket} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42")

      assert socket.assigns.current_scope == %Trento.Users.User{id: 42}
      assert socket.assigns.loading == false
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

    test "rejects with :ai_assistant_disabled when AI features are disabled" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      assert {:error, :ai_assistant_disabled} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42")
    end

    test "prefers :ai_assistant_disabled over :unauthorized when AI is disabled with mismatched user_id" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      assert {:error, :ai_assistant_disabled} =
               UserSocket
               |> socket("user_id", %{current_user_id: 1})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:2")
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

  describe "handle_info {:agent, {:status_changed, :running, ...}}" do
    setup :join_socket

    test "marks run_has_started", %{socket: socket} do
      send(socket.channel_pid, {:agent, {:status_changed, :running, nil}})
      assigns = wait_assigns(socket)

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

    test "skips TEXT_MESSAGE_END when :idle arrives but message_started is false",
         %{socket: socket} do
      seed_assigns(socket, %{
        run_has_started: true,
        message_started: false,
        current_run_id: "r1",
        current_thread_id: "t1",
        message_id: "m1"
      })

      send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})

      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED", "runId" => "r1"})
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_END"}, 100)
    end
  end

  describe "handle_info {:agent, {:status_changed, :error, ...}}" do
    setup :join_socket

    test "emits RUN_ERROR with the binary reason passed verbatim (no prefix)",
         %{socket: socket} do
      send(socket.channel_pid, {:agent, {:status_changed, :error, "boom"}})

      assert_push("ag_ui_event", %{"type" => "RUN_ERROR", "message" => "boom"})
    end

    test "emits RUN_ERROR with `Sorry, ...` prefix for %LangChainError{}",
         %{socket: socket} do
      error = LangChain.LangChainError.exception(type: "x", message: "stream gone")
      send(socket.channel_pid, {:agent, {:status_changed, :error, error}})

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Sorry, I encountered an error: stream gone"
      })
    end

    test "emits RUN_ERROR with `Sorry, ...` + inspect for arbitrary term",
         %{socket: socket} do
      send(socket.channel_pid, {:agent, {:status_changed, :error, :timeout}})

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Sorry, I encountered an error: :timeout"
      })
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

  describe "handle_in send_message/3 — happy path" do
    test "calls Agent.run/2 and pushes RUN_STARTED on success" do
      %{id: user_id} = insert(:user)

      insert(:ai_user_configuration,
        user_id: user_id,
        provider: :googleai,
        model: "gemini-2.5-flash"
      )

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: user_id})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}")

      Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)
      Mox.allow(Trento.AI.Agent.Server.Mock, self(), socket.channel_pid)

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _opts ->
        {:ok, self()}
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _agent_id, _msg -> :ok end)

      run_id = "run-#{System.unique_integer([:positive])}"
      thread_id = "thread-#{System.unique_integer([:positive])}"

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => run_id,
        "thread_id" => thread_id
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_STARTED",
        "runId" => ^run_id,
        "threadId" => ^thread_id
      })

      assert %{
               loading: true,
               message_id: ^run_id,
               message_started: false,
               run_has_started: false
             } = wait_assigns(socket)
    end
  end

  describe "handle_in send_message/3 — error paths" do
    test "emits verbatim RUN_ERROR when user has no AI configuration" do
      %{id: user_id} = insert(:user)

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: user_id})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}")

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r1",
        "thread_id" => "t1"
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Failed to start agent. No AI configuration found for user."
      })
    end

    test "emits verbatim RUN_ERROR when sagents start_agent_sync fails" do
      %{id: user_id} = insert(:user)

      insert(:ai_user_configuration,
        user_id: user_id,
        provider: :googleai,
        model: "gemini-2.5-flash"
      )

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: user_id})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}")

      Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ ->
        {:error, :boom}
      end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r1",
        "thread_id" => "t1"
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Failed to start agent: :boom"
      })
    end
  end

  defp join_socket(_context) do
    {:ok, _, socket} =
      UserSocket
      |> socket("user_id", %{current_user_id: 7})
      |> subscribe_and_join(AIAssistantChannel, "ai_assistant:7")

    %{socket: socket}
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
    state = :sys.get_state(socket.channel_pid)
    state.assigns
  end
end
