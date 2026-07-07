# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannelTest do
  @moduledoc """
  Channel tests covering:

  - `join/3` — happy path + auth rejections
  - `handle_in/3` for `send_message` payload contract + `new_thread`
  - `handle_info/2` translation of `{:agent, ...}` PubSub events into AG-UI
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

  alias LangChain.ChatModels.ChatGoogleAI
  alias Trento.AI.LLMBuilder
  alias TrentoWeb.Auth.AccessToken

  alias TrentoWeb.AIAssistantChannel
  alias TrentoWeb.UserSocket

  setup :verify_on_exit!

  setup do
    stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_700_000_000 end)
    :ok
  end

  describe "join/3 — access_token validation" do
    test "accepts valid token, updates :access_token assign, and joins" do
      jwt = generate_jwt(42)

      assert {:ok, _, socket} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => jwt
               })

      assert socket.assigns.access_token == jwt
      assert socket.assigns.current_scope == %Trento.Users.User{id: 42}
    end

    test "rejects with :unauthorized for an invalid token" do
      assert {:error, :unauthorized} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => "bad.jwt.token"
               })
    end

    test "rejects with :unauthorized when token user does not match current_user_id" do
      jwt_for_other_user = generate_jwt(99)

      assert {:error, :unauthorized} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => jwt_for_other_user
               })
    end
  end

  describe "join/3" do
    test "joins ai_assistant:<user_id> when current_user_id matches" do
      jwt = generate_jwt(42)

      assert {:ok, _, socket} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => jwt
               })

      assert socket.assigns.current_scope == %Trento.Users.User{id: 42}
      assert socket.assigns.loading == false
    end

    test "rejects with :unauthorized when current_user_id does not match topic" do
      assert {:error, :unauthorized} =
               UserSocket
               |> socket("user_id", %{current_user_id: 1})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:2", %{
                 "access_token" => generate_jwt(1)
               })
    end

    test "rejects with :user_not_logged when current_user_id is absent" do
      assert {:error, :user_not_logged} =
               UserSocket
               |> socket("user_id", %{})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => generate_jwt(42)
               })
    end

    test "rejects with :user_not_logged when access_token is missing from payload" do
      assert {:error, :user_not_logged} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42")
    end

    test "rejects with :ai_assistant_disabled when AI features are disabled" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      assert {:error, :ai_assistant_disabled} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => generate_jwt(42)
               })
    end

    test "prefers :ai_assistant_disabled over :unauthorized when AI is disabled with mismatched user_id" do
      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      assert {:error, :ai_assistant_disabled} =
               UserSocket
               |> socket("user_id", %{current_user_id: 1})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:2", %{
                 "access_token" => generate_jwt(1)
               })
    end

    test "rejects with :unauthorized for non-numeric topic suffix (does not crash)" do
      assert {:error, :unauthorized} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:abc", %{
                 "access_token" => generate_jwt(42)
               })
    end

    test "rejects with :unauthorized for numeric topic with trailing garbage" do
      assert {:error, :unauthorized} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42xyz", %{
                 "access_token" => generate_jwt(42)
               })
    end
  end

  describe "handle_in send_message/3 — payload contract" do
    setup :join_socket

    test "ignores empty message text", %{socket: socket, access_token: jwt} do
      ref =
        push(socket, "send_message", %{
          "message" => "",
          "run_id" => "r1",
          "thread_id" => "t1",
          "access_token" => jwt
        })

      refute_reply(ref, _, 100)
      refute_push("agent_error", _, 100)
    end

    test "ignores whitespace-only message text", %{socket: socket, access_token: jwt} do
      ref =
        push(socket, "send_message", %{
          "message" => "   \n\t  ",
          "run_id" => "r1",
          "thread_id" => "t1",
          "access_token" => jwt
        })

      refute_reply(ref, _, 100)
      refute_push("agent_error", _, 100)
    end

    test "rejects payload missing :message", %{socket: socket, access_token: jwt} do
      ref =
        push(socket, "send_message", %{
          "run_id" => "r1",
          "thread_id" => "t1",
          "access_token" => jwt
        })

      assert_reply(ref, :error, :invalid_payload)
    end

    test "rejects payload missing :run_id", %{socket: socket, access_token: jwt} do
      ref =
        push(socket, "send_message", %{
          "message" => "hi",
          "thread_id" => "t1",
          "access_token" => jwt
        })

      assert_reply(ref, :error, :invalid_payload)
    end

    test "rejects payload missing :thread_id", %{socket: socket, access_token: jwt} do
      ref =
        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => "r1",
          "access_token" => jwt
        })

      assert_reply(ref, :error, :invalid_payload)
    end

    test "rejects payload missing :access_token", %{socket: socket} do
      ref =
        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => "r1",
          "thread_id" => "t1"
        })

      assert_reply(ref, :error, :invalid_payload)
    end

    test "drops send while :loading is true and does NOT overwrite prior run_id/thread_id",
         %{socket: socket, access_token: jwt} do
      seed_assigns(socket, %{
        loading: true,
        current_run_id: "prior-run",
        current_thread_id: "prior-thread"
      })

      ref =
        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => "new-run",
          "thread_id" => "new-thread",
          "access_token" => jwt
        })

      refute_reply(ref, _, 100)
      refute_push("ag_ui_event", _, 100)

      assert %{current_run_id: "prior-run", current_thread_id: "prior-thread"} =
               wait_assigns(socket)
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

  describe "handle_in send_message/3 — access_token validation" do
    setup :join_socket_with_ai_config

    test "updates :access_token assign and starts run when token is valid",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hello",
        "run_id" => "r-tok",
        "thread_id" => "t-tok",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})
      assert %{access_token: ^jwt} = wait_assigns(socket)
    end

    test "replies {:error, :unauthorized} and does not start run for invalid token",
         %{socket: socket} do
      ref =
        push(socket, "send_message", %{
          "message" => "hello",
          "run_id" => "r-bad",
          "thread_id" => "t-bad",
          "access_token" => "bad.jwt.token"
        })

      assert_reply ref, :error, :unauthorized
      refute_push("ag_ui_event", _, 100)
    end

    test "replies {:error, :unauthorized} when token sub does not match the socket user",
         %{socket: socket} do
      jwt_for_other_user = generate_jwt(99)

      ref =
        push(socket, "send_message", %{
          "message" => "hello",
          "run_id" => "r-wrong-user",
          "thread_id" => "t-wrong-user",
          "access_token" => jwt_for_other_user
        })

      assert_reply ref, :error, :unauthorized
      refute_push("ag_ui_event", _, 100)
    end
  end

  describe "handle_in send_message/3 — tool_context" do
    setup :join_socket_with_ai_config

    test "forwards the per-message access_token into the agent's tool_context",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)
      test_pid = self()

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn opts ->
        send(test_pid, {:agent_opts, opts})
        {:ok, self()}
      end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-jwt",
        "thread_id" => "t-jwt",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      assert_receive {:agent_opts, opts}, 1_000
      assert %Sagents.Agent{tool_context: %{access_token: ^jwt}} = opts[:agent]
    end

    test "pushes the fresh token into the running AgentServer via update_agent_and_state when stale",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)
      test_pid = self()

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ ->
        {:ok, %{tool_context: %{access_token: "stale_token"}}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :get_info, fn agent_id ->
        %{state: %Sagents.State{agent_id: agent_id}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn _agent_id,
                                                                      fresh_agent,
                                                                      _state ->
        send(test_pid, {:updated_with, fresh_agent})
        :ok
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-stale",
        "thread_id" => "t-stale",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      assert_receive {:updated_with, %Sagents.Agent{tool_context: %{access_token: ^jwt}}}, 1_000
    end

    test "does not call update_agent_and_state when running AgentServer already holds the same token and model",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)
      # Same model the channel will build for this user + same token → :noop.
      {:ok, same_model} = LLMBuilder.build_for_user(user_id)

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ ->
        {:ok, %Sagents.Agent{model: same_model, tool_context: %{access_token: jwt}}}
      end)

      # No get_info / update_agent_and_state expectations —
      # token AND model match so the channel's refresh_when returns :noop.
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-same",
        "thread_id" => "t-same",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})
      # unchanged config → no model-change notice bubble
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_START"}, 100)
    end

    test "forwards :request_origin into the agent's tool_context",
         %{socket: socket, user_id: user_id, request_origin: request_origin} do
      jwt = generate_jwt(user_id)
      test_pid = self()

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn opts ->
        send(test_pid, {:agent_opts, opts})
        {:ok, self()}
      end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-origin",
        "thread_id" => "t-origin",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      assert_receive {:agent_opts, opts}, 1_000

      assert %Sagents.Agent{
               tool_context: %{request_origin: ^request_origin}
             } = opts[:agent]
    end

    test "tolerates :request_origin = nil and still starts the run", %{user_id: user_id} do
      jwt = generate_jwt(user_id)

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: user_id, request_origin: nil})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}", %{
          "access_token" => jwt
        })

      Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)
      Mox.allow(Trento.AI.Agent.Server.Mock, self(), socket.channel_pid)

      test_pid = self()

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn opts ->
        send(test_pid, {:agent_opts, opts})
        {:ok, self()}
      end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-no-origin",
        "thread_id" => "t-no-origin",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      assert_receive {:agent_opts, opts}, 1_000

      assert %Sagents.Agent{
               tool_context: %{access_token: ^jwt, request_origin: nil}
             } = opts[:agent]
    end
  end

  describe "handle_in send_message/3 — AI settings drift" do
    setup :join_socket_with_ai_config

    test "swaps the running agent when the model changed",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)
      test_pid = self()

      # Running agent was started with a different model (same provider, older
      # model) + the same token → only the model changed.
      running_model = ChatGoogleAI.new!(%{model: "gemini-2.5-pro", api_key: "k", stream: true})

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ ->
        {:ok, %Sagents.Agent{model: running_model, tool_context: %{access_token: jwt}}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :get_info, fn agent_id ->
        %{state: %Sagents.State{agent_id: agent_id}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn _agent_id,
                                                                      swapped_agent,
                                                                      _state ->
        send(test_pid, {:swapped_with, swapped_agent})
        :ok
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-drift",
        "thread_id" => "t-drift",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      # the running agent is hot-swapped to the newly-built (gemini-2.5-flash) model
      assert_receive {:swapped_with,
                      %Sagents.Agent{model: %ChatGoogleAI{model: "gemini-2.5-flash"}}},
                     1_000

      # the change is surfaced proactively over the ai_user_config topic (see the
      # "ai_user_config lifecycle" tests), not as an in-conversation bubble
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_START"}, 100)
    end

    test "swaps the running agent silently when only the api key changed",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)
      test_pid = self()

      # Same provider + model as the channel will build, but a different api key.
      running_model =
        ChatGoogleAI.new!(%{model: "gemini-2.5-flash", api_key: "OLD-KEY", stream: true})

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ ->
        {:ok, %Sagents.Agent{model: running_model, tool_context: %{access_token: jwt}}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :get_info, fn agent_id ->
        %{state: %Sagents.State{agent_id: agent_id}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn _agent_id,
                                                                      swapped_agent,
                                                                      _state ->
        send(test_pid, {:swapped_with, swapped_agent})
        :ok
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-key",
        "thread_id" => "t-key",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      # the agent is still hot-swapped (so the new key takes effect)...
      assert_receive {:swapped_with, %Sagents.Agent{}}, 1_000
      # ...but no user-facing bubble, since provider/model are unchanged
      refute_push("ag_ui_event", %{"type" => "TEXT_MESSAGE_START"}, 100)
    end
  end

  describe "handle_in send_message/3 — happy path" do
    setup :join_socket_with_ai_config

    test "calls Agent.run/2 and pushes RUN_STARTED on success",
         %{socket: socket, access_token: jwt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _opts ->
        {:ok, self()}
      end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _agent_id, _msg -> :ok end)

      run_id = "run-#{System.unique_integer([:positive])}"
      thread_id = "thread-#{System.unique_integer([:positive])}"

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => run_id,
        "thread_id" => thread_id,
        "access_token" => jwt
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
      jwt = generate_jwt(user_id)

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{
          current_user_id: user_id,
          request_origin: "https://trento.test"
        })
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}", %{
          "access_token" => jwt
        })

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r1",
        "thread_id" => "t1",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Failed to start agent. No AI configuration found for user."
      })
    end

    test "does NOT stash run_id/thread_id when LLMBuilder errors out" do
      %{id: user_id} = insert(:user)
      jwt = generate_jwt(user_id)

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{
          current_user_id: user_id,
          request_origin: "https://trento.test"
        })
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}", %{
          "access_token" => jwt
        })

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "should-not-stash",
        "thread_id" => "should-not-stash",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_ERROR"})

      assigns = wait_assigns(socket)
      refute Map.has_key?(assigns, :current_run_id)
      refute Map.has_key?(assigns, :current_thread_id)
    end

    test "emits verbatim RUN_ERROR when sagents start_agent_sync fails" do
      %{id: user_id} = insert(:user)
      jwt = generate_jwt(user_id)

      insert(:ai_user_configuration,
        user_id: user_id,
        provider: :googleai,
        model: "gemini-2.5-flash"
      )

      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{
          current_user_id: user_id,
          request_origin: "https://trento.test"
        })
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}", %{
          "access_token" => jwt
        })

      Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)
      Mox.allow(Trento.AI.Agent.Server.Mock, self(), socket.channel_pid)

      # run_agent probes the running agent (for model-drift detection) before
      # starting it — brand-new thread here, so :not_found.
      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ ->
        {:error, :boom}
      end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r1",
        "thread_id" => "t1",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Failed to start agent: :boom"
      })
    end
  end

  describe "handle_info — ai_configuration cleared" do
    setup :join_socket_with_ai_config

    test "stops the active agent, pushes ai_configuration_cleared, and resets loading",
         %{socket: socket, user_id: user_id} do
      seed_assigns(socket, %{
        current_thread_id: "t-live",
        loading: true,
        run_has_started: true
      })

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" -> :ok end)

      Trento.AI.broadcast_ai_configuration_cleared(user_id)

      assert_push("ai_configuration_cleared", %{})
      assert %{loading: false} = wait_assigns(socket)
    end

    test "pushes ai_configuration_cleared without stopping any agent when no thread is active",
         %{user_id: user_id} do
      # No current_thread_id seeded → no stop_agent expectation.
      # verify_on_exit! catches a stray stop_agent call.
      Trento.AI.broadcast_ai_configuration_cleared(user_id)

      assert_push("ai_configuration_cleared", %{})
    end

    test "pushes ai_configuration_created when the configuration is (re)created",
         %{user_id: user_id} do
      Trento.AI.broadcast_ai_configuration_created(user_id)

      assert_push("ai_configuration_created", %{})
    end

    test "pushes model_changed when the provider/model is updated", %{user_id: user_id} do
      Trento.AI.broadcast_ai_configuration_updated(user_id, %{
        provider: :googleai,
        model: "gemini-2.5-pro"
      })

      assert_push("model_changed", %{provider: :googleai, model: "gemini-2.5-pro"})
    end
  end

  defp join_socket(_context) do
    jwt = generate_jwt(7)
    request_origin = "https://trento.test"

    {:ok, _, socket} =
      UserSocket
      |> socket("user_id", %{current_user_id: 7, request_origin: request_origin})
      |> subscribe_and_join(AIAssistantChannel, "ai_assistant:7", %{
        "access_token" => jwt
      })

    %{socket: socket, access_token: jwt, request_origin: request_origin}
  end

  defp join_socket_with_ai_config(_context) do
    %{id: user_id} = insert(:user)
    jwt = generate_jwt(user_id)
    request_origin = "https://trento.test"

    insert(:ai_user_configuration,
      user_id: user_id,
      provider: :googleai,
      model: "gemini-2.5-flash"
    )

    {:ok, _, socket} =
      UserSocket
      |> socket("user_id", %{current_user_id: user_id, request_origin: request_origin})
      |> subscribe_and_join(AIAssistantChannel, "ai_assistant:#{user_id}", %{
        "access_token" => jwt
      })

    Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)
    Mox.allow(Trento.AI.Agent.Server.Mock, self(), socket.channel_pid)

    %{
      socket: socket,
      user_id: user_id,
      access_token: jwt,
      request_origin: request_origin
    }
  end

  defp generate_jwt(sub), do: AccessToken.generate_access_token!(%{"sub" => sub})

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
