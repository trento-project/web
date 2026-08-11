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

  import Phoenix.ChannelTest, except: [assert_push: 2]

  import Mox
  import Trento.Factory

  alias LangChain.ChatModels.ChatGoogleAI
  alias Sagents.AgentServer
  alias Sagents.AgentSupervisor
  alias Trento.AI.LLMBuilder
  alias Trento.Infrastructure.AI.{SagentsAgentServer, SagentsDynamicSupervisor}
  alias TrentoWeb.Auth.AccessToken

  alias TrentoWeb.AIAssistantChannel
  alias TrentoWeb.UserSocket

  alias Trento.AI.Configurations.Events, as: AIConfigurationsEvents

  # Shadow `assert_push` so that we can add a timeout once for all the call sites.
  #
  # Why it needs widening:
  # because the first `send_message` pays a one-time warm-up cost about tool generation
  # and so we mitigate possible timing out if resources are constrained.
  @push_timeout 500

  # Integration describes boot a real agent tree, so they wait longer than the
  # Mox-backed ones and park the (stubbed) LLM transport for a bounded time.
  @integration_timeout 5_000
  @park_for 5_000

  defmacrop assert_push(event, payload) do
    quote do
      Phoenix.ChannelTest.assert_push(unquote(event), unquote(payload), @push_timeout)
    end
  end

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

    test "subscribes the joined channel to AI configuration lifecycle events" do
      {:ok, _, _socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: 42})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
          "access_token" => generate_jwt(42)
        })

      AIConfigurationsEvents.broadcast_created(42)

      assert_push("ai_configuration_created", %{})
    end

    test "rejects the join when subscribing to AI configuration events fails" do
      ai = Application.get_env(:trento, :ai)

      Application.put_env(
        :trento,
        :ai,
        Keyword.put(ai, :ai_configuration_events_adapter, AIConfigurationsEvents.Mock)
      )

      on_exit(fn -> Application.put_env(:trento, :ai, ai) end)

      expect(AIConfigurationsEvents.Mock, :subscribe, fn _ -> {:error, :no_pubsub} end)

      assert {:error, :unable_to_subscribe_to_ai_configuration_events} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
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

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ ->
        {:ok, %{tool_context: %{access_token: "stale_token"}}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :get_info, fn agent_id ->
        %{state: %Sagents.State{agent_id: agent_id}}
      end)

      # the agent handed to the AgentServer carries the token from this very message
      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn _agent_id,
                                                                      %Sagents.Agent{
                                                                        tool_context: %{
                                                                          access_token: ^jwt
                                                                        }
                                                                      },
                                                                      _state ->
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

      # Token AND model match, so the channel's agent_config_changed/2 returns
      # :noop and Trento.AI.Agent.update_agent/2 is never reached.
      expect(Trento.AI.Agent.Server.Mock, :get_info, 0, fn agent_id ->
        %{state: %Sagents.State{agent_id: agent_id}}
      end)

      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, 0, fn _agent_id,
                                                                         _agent,
                                                                         _state ->
        :ok
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r-same",
        "thread_id" => "t-same",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})
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

      # The model the channel will build for this user — pins provider, model
      # name and api key in one match.
      {:ok, expected_model} = LLMBuilder.build_for_user(user_id)

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

      # the running agent is hot-swapped to the newly-built (gemini-2.5-flash) model
      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn _agent_id,
                                                                      %Sagents.Agent{
                                                                        model: ^expected_model
                                                                      },
                                                                      _state ->
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
    end

    test "swaps the running agent silently when only the api key changed",
         %{socket: socket, user_id: user_id} do
      jwt = generate_jwt(user_id)

      # The model the channel will build for this user — pins provider, model
      # name and api key in one match.
      {:ok, expected_model} = LLMBuilder.build_for_user(user_id)

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

      # the agent is still hot-swapped, so the new key takes effect
      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn _agent_id,
                                                                      %Sagents.Agent{
                                                                        model: ^expected_model
                                                                      },
                                                                      _state ->
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

  describe "handle_in cancel_run/3" do
    setup :join_socket_with_ai_config

    test "cancels the in-flight run and clears the double-send guard",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      # No `expect` on Supervisor.Mock: Mox is strict, so terminating the
      # agent here would fail the test. Stop keeps the thread alive.
      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)

      ref = push(socket, "cancel_run", %{"run_id" => "r1", "thread_id" => "t-live"})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end

    test "lets the next prompt on the same thread through — the point of clearing :loading",
         %{socket: socket, access_token: jwt} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)

      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _opts ->
        {:ok, self()}
      end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _agent_id, _msg -> :ok end)

      # Same thread: cancelling keeps the conversation, so the follow-up
      # prompt addresses the agent that is still standing.
      push(socket, "send_message", %{
        "message" => "a follow-up prompt",
        "run_id" => "r2",
        "thread_id" => "t-live",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{
        "type" => "RUN_STARTED",
        "runId" => "r2",
        "threadId" => "t-live"
      })
    end

    test "pushes no AG-UI event back — the client already settled its own run",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)

      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok

      refute_push("ag_ui_event", _payload)
    end

    test "shrugs off a cancel for a thread with nothing running",
         %{socket: socket} do
      seed_assigns(socket, %{loading: false, current_thread_id: "t-idle"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-idle" ->
        {:error, "Cannot cancel, server is not running (status: idle)"}
      end)

      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end

    test "replies :ok without touching sagents when no thread was ever stashed",
         %{socket: socket} do
      # No `expect` on either mock: Mox is strict, so an unexpected call from
      # here fails the test.
      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end

    test "clears :loading even when no thread was ever stashed to cancel",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true})

      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end
  end

  describe "handle_in abandon_thread/3" do
    setup :join_socket_with_ai_config

    test "stops the running thread's agent and clears the double-send guard",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" -> :ok end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end

    test "stops the thread's agent even when no run is in flight",
         %{socket: socket} do
      seed_assigns(socket, %{loading: false, current_thread_id: "t-idle"})

      # "New chat" is only reachable when the thread is idle, and an idle
      # agent still holds the abandoned conversation — nothing will ever
      # address that thread id again.
      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-idle" ->
        {:error, "Cannot cancel, server is not running (status: idle)"}
      end)

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-idle" -> :ok end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end

    test "lets the first prompt of the new chat through",
         %{socket: socket, access_token: jwt} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" -> :ok end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _opts ->
        {:ok, self()}
      end)

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _agent_id, _msg -> :ok end)

      push(socket, "send_message", %{
        "message" => "first prompt of the new chat",
        "run_id" => "r2",
        "thread_id" => "t-new",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED", "threadId" => "t-new"})
    end

    test "pushes no AG-UI event back", %{socket: socket} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" -> :ok end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      refute_push("ag_ui_event", _payload)
    end

    test "replies :ok without touching sagents when no thread was ever stashed",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true})

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end
  end

  # Every describe above stops at the Mox adapter boundary: they prove the
  # channel calls `stop/1`, not that a real agent dies. This one drives the
  # whole stack — channel → Trento.AI.Agent → real Sagents supervisor + server
  # → LangChain → the model LLMBuilder builds from the user's configuration —
  # with only the HTTP hop replaced (see `parked_llm_transport/1`).
  describe "handle_in abandon_thread/3 — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :parked_llm_transport]

    test "tears down the thread's agent mid-run, pushing nothing back",
         %{socket: socket, access_token: jwt} do
      thread_id = start_run!(socket, jwt, run_id: "r1")

      assert {:ok, pid} = AgentSupervisor.get_pid(thread_id)
      monitor = Process.monitor(pid)

      ref = push(socket, "abandon_thread", %{})

      # The reply lands well inside the model's 5s park: the run is cancelled
      # before `terminate/2` gets a chance to wait for it.
      assert_reply ref, :ok, %{}, 1_000

      # The client settled its own run before asking, so a RUN_FINISHED or
      # RUN_ERROR here would surface a phantom event in the *next* thread.
      refute_push("ag_ui_event", _payload, @push_timeout)

      # Run *and* conversation are gone — nothing addresses this thread again.
      assert_receive {:DOWN, ^monitor, :process, ^pid, _reason}, @integration_timeout
      assert catch_exit(AgentServer.get_info(thread_id))

      assert %{loading: false} = wait_assigns(socket)
    end

    # The park is short enough for the run to end on its own: the model answers
    # `{}`, which LangChain rejects, so the agent goes back to resting with its
    # conversation still in memory — the state "New chat" leaves behind when
    # the user reads an answer before starting over.
    @tag park_for: 50
    test "tears down a thread that is no longer streaming",
         %{socket: socket, access_token: jwt} do
      thread_id = start_run!(socket, jwt, run_id: "r1")

      Phoenix.ChannelTest.assert_push(
        "ag_ui_event",
        %{"type" => "RUN_ERROR"},
        @integration_timeout
      )

      assert {:ok, pid} = AgentSupervisor.get_pid(thread_id)
      assert Process.alive?(pid)
      monitor = Process.monitor(pid)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert_receive {:DOWN, ^monitor, :process, ^pid, _reason}, @integration_timeout
    end

    test "lets the next prompt through — a new run starts on the same socket",
         %{socket: socket, access_token: jwt} do
      start_run!(socket, jwt, run_id: "r1")

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      # A new chat means a new thread id, hence a brand new agent behind it.
      new_thread_id = "thread-#{Faker.UUID.v4()}"
      on_exit(fn -> cleanup_agent(new_thread_id) end)

      push(socket, "send_message", %{
        "message" => "first prompt of the new chat",
        "run_id" => "r2",
        "thread_id" => new_thread_id,
        "access_token" => jwt
      })

      Phoenix.ChannelTest.assert_push(
        "ag_ui_event",
        %{"type" => "RUN_STARTED", "runId" => "r2"},
        @integration_timeout
      )

      assert_receive {:llm_request, _task_pid}, @integration_timeout
    end
  end

  # The counterpart: Stop cancels the run and leaves the agent standing, so the
  # same thread can be prompted again. Same real stack as the describe above.
  describe "handle_in cancel_run/3 — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :parked_llm_transport]

    test "cancels the run without killing the thread's agent",
         %{socket: socket, access_token: jwt} do
      thread_id = start_run!(socket, jwt, run_id: "r1")

      assert {:ok, pid} = AgentSupervisor.get_pid(thread_id)
      monitor = Process.monitor(pid)

      ref = push(socket, "cancel_run", %{"run_id" => "r1", "thread_id" => thread_id})

      # Well inside the model's 5s park: the run is cancelled, not waited out.
      assert_reply ref, :ok, %{}, 1_000

      # The client settled its own run before asking, so a RUN_FINISHED or
      # RUN_ERROR here would surface a phantom event.
      refute_push("ag_ui_event", _payload, @push_timeout)

      # The agent — and the conversation it holds — outlives the cancel.
      refute_receive {:DOWN, ^monitor, :process, ^pid, _reason}, @push_timeout
      assert Process.alive?(pid)

      assert %{loading: false} = wait_assigns(socket)
    end

    test "lets the same thread be prompted again after the cancel",
         %{socket: socket, access_token: jwt} do
      thread_id = start_run!(socket, jwt, run_id: "r1")

      ref = push(socket, "cancel_run", %{"run_id" => "r1", "thread_id" => thread_id})
      assert_reply ref, :ok, %{}, 1_000

      push(socket, "send_message", %{
        "message" => "a follow-up prompt",
        "run_id" => "r2",
        "thread_id" => thread_id,
        "access_token" => jwt
      })

      Phoenix.ChannelTest.assert_push(
        "ag_ui_event",
        %{"type" => "RUN_STARTED", "runId" => "r2", "threadId" => ^thread_id},
        @integration_timeout
      )

      assert_receive {:llm_request, _task_pid}, @integration_timeout
    end
  end

  # The other end of the lifecycle: clearing the AI configuration stops the
  # thread's agent outright. Same real stack as the cancel describe above, so
  # what `stop/1` actually costs the channel is visible here.
  describe "handle_info ai_configuration cleared — integration (real supervisor + server)" do
    @describetag :integration
    # Long enough that anything waiting for the run to end would blow the
    # sub-second deadlines below.
    @describetag park_for: 3_000

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :parked_llm_transport]

    test "tears down the agent of the thread that is mid-run",
         %{socket: socket, access_token: jwt, user_id: user_id} do
      thread_id = start_run!(socket, jwt, run_id: "r1")

      assert {:ok, pid} = AgentSupervisor.get_pid(thread_id)
      ref = Process.monitor(pid)

      AIConfigurationsEvents.broadcast_cleared(user_id)

      assert_receive {:DOWN, ^ref, :process, ^pid, _reason}, @integration_timeout

      Phoenix.ChannelTest.assert_push("ai_configuration_cleared", %{}, @integration_timeout)
      assert %{loading: false} = wait_assigns(socket)
    end

    test "does not freeze the socket for the length of the in-flight run",
         %{socket: socket, access_token: jwt, user_id: user_id} do
      start_run!(socket, jwt, run_id: "r1")

      AIConfigurationsEvents.broadcast_cleared(user_id)

      # `stop/1` runs on the channel process, and `Sagents.AgentServer.
      # terminate/2` waits for a running task (up to 25s) — so without the
      # cancel that `stop/1` does first, the channel would answer nothing until
      # the model was done, including the user's attempt to abandon the run.
      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok, %{}, 1_000

      Phoenix.ChannelTest.assert_push("ai_configuration_cleared", %{}, 1_000)
    end
  end

  describe "handle_info — listening on ai configuration events" do
    setup :join_socket_with_ai_config

    test "stops the active agent, pushes ai_configuration_cleared, and resets loading",
         %{socket: socket, user_id: user_id} do
      seed_assigns(socket, %{
        current_thread_id: "t-live",
        loading: true,
        run_has_started: true
      })

      # stop/1 cancels the in-flight run before terminating the agent.
      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" -> :ok end)

      Trento.AI.Configurations.Events.broadcast_cleared(user_id)

      assert_push("ai_configuration_cleared", %{})
      assert %{loading: false} = wait_assigns(socket)
    end

    test "still goes read-only when stopping the agent fails (best-effort stop)",
         %{socket: socket, user_id: user_id} do
      seed_assigns(socket, %{
        current_thread_id: "t-live",
        loading: true,
        run_has_started: true
      })

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> {:error, :not_found} end)

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" ->
        {:error, :not_found}
      end)

      AIConfigurationsEvents.broadcast_cleared(user_id)

      assert_push("ai_configuration_cleared", %{})
      assert %{loading: false} = wait_assigns(socket)
    end

    test "pushes ai_configuration_cleared without stopping any agent when no thread is active",
         %{user_id: user_id} do
      # No current_thread_id seeded → no stop_agent expectation.
      # verify_on_exit! catches a stray stop_agent call.
      AIConfigurationsEvents.broadcast_cleared(user_id)

      assert_push("ai_configuration_cleared", %{})
    end

    test "pushes ai_configuration_created when the configuration is (re)created",
         %{user_id: user_id} do
      AIConfigurationsEvents.broadcast_created(user_id)

      assert_push("ai_configuration_created", %{})
    end

    test "pushes model_changed when the provider/model is updated", %{user_id: user_id} do
      AIConfigurationsEvents.broadcast_updated(user_id, %{
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

  # Swaps the Mox adapters (see config/test.exs) for the real sagents ones, so
  # `send_message` boots an actual agent process tree.
  defp real_sagents_adapters(_context) do
    ai = Application.get_env(:trento, :ai)

    Application.put_env(
      :trento,
      :ai,
      ai
      |> Keyword.put(:agent_supervisor_adapter, SagentsDynamicSupervisor)
      |> Keyword.put(:agent_server_adapter, SagentsAgentServer)
    )

    on_exit(fn -> Application.put_env(:trento, :ai, ai) end)
  end

  # The channel builds its model through `LLMBuilder`, so there is no seam to
  # hand it a fake ChatModel — the seam sits one layer lower. A global Req
  # default `:plug` replaces the HTTP hop and parks in the calling process, the
  # agent's run task, keeping the run genuinely in flight until it is cancelled.
  #
  # The park is bounded: a cancel that fails to kill the task then fails the
  # test's own assertions instead of hanging CI. Setting a global Req option is
  # safe here because the module is synchronous — ExUnit never overlaps it with
  # another test.
  defp parked_llm_transport(context) do
    test_pid = self()
    park_for = Map.get(context, :park_for, @park_for)
    previous_options = Req.default_options()

    Req.default_options(
      plug: fn conn ->
        send(test_pid, {:llm_request, self()})
        Process.sleep(park_for)
        Req.Test.json(conn, %{})
      end
    )

    on_exit(fn -> Req.default_options(previous_options) end)
  end

  # Pushes a prompt and blocks until the run is really on the wire, so a
  # following `cancel_run` has something to cancel. Returns the thread id.
  defp start_run!(socket, jwt, opts) do
    run_id = Keyword.fetch!(opts, :run_id)
    thread_id = "thread-#{Faker.UUID.v4()}"

    push(socket, "send_message", %{
      "message" => "hello",
      "run_id" => run_id,
      "thread_id" => thread_id,
      "access_token" => jwt
    })

    Phoenix.ChannelTest.assert_push(
      "ag_ui_event",
      %{"type" => "RUN_STARTED", "runId" => ^run_id, "threadId" => ^thread_id},
      @integration_timeout
    )

    assert_receive {:llm_request, _task_pid}, @integration_timeout

    on_exit(fn -> cleanup_agent(thread_id) end)

    thread_id
  end

  # Runs in the on_exit process, which owns no Mox stubs — hence the sagents
  # adapters directly instead of the config-driven `Trento.AI.Agent` wrappers.
  #
  # Cancel before stop: a still-running task would make terminate/2 park.
  defp cleanup_agent(thread_id) do
    AgentServer.cancel(thread_id)
  catch
    :exit, _reason -> :ok
  after
    SagentsDynamicSupervisor.stop_agent(thread_id)
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
