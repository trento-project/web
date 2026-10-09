# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannelTest do
  @moduledoc """
  Channel tests covering:

  - `join/3` — happy path + auth rejections
  - `handle_in/3` for `send_message` payload contract, `cancel_run` and
    `abandon_thread`
  - `handle_info/2` translation of `{:agent, ...}` PubSub events into AG-UI
    wire events (the bug-prone surface)

  The `handle_info` tests use `:sys.replace_state/2` as a test-only
  escape hatch to seed `socket.assigns` with values that would normally
  be set after a full `send_message` round-trip. This bypasses the
  JS-driven assigns chain to exercise the individual handlers in
  isolation.

  Most `send_message` coverage stops at the Mox doubles for the sagents adapter
  boundary (`Trento.AI.Agent.{Server, Supervisor}`, routed via
  `config/test.exs`). The describes tagged `:integration` go past it: they run
  the real supervisor and server with only the chat model faked, which is where
  the model → AG-UI chain is pinned end to end.
  """

  use TrentoWeb.ChannelCase, async: true
  use Trento.AI.AICase

  import Phoenix.ChannelTest, except: [assert_push: 2, assert_push: 3]

  import ExUnit.CaptureLog
  import Mox
  import Trento.Factory

  alias LangChain.ChatModels.ChatGoogleAI
  alias Trento.AI.Agent.Server, as: TrentoAIAgentServer
  alias Trento.AI.ApplicationConfigLoader
  alias Trento.AI.LLMBuilder
  alias TrentoWeb.Auth.AccessToken

  alias TrentoWeb.AIAssistantChannel
  alias TrentoWeb.UserSocket

  alias Trento.AI.Configurations.Events, as: AIConfigurationsEvents

  # Shadow `assert_push` so that we can add a timeout once for all the call sites.
  #
  # Why it needs widening:
  # because the first `send_message` pays a one-time warm-up cost about tool generation
  # and so we mitigate possible timing out if resources are constrained.
  #
  # Integration tests pass `@integration_timeout` instead: booting the real
  # sagents tree costs more than the warm-up alone.
  @push_timeout 500

  defmacrop assert_push(event, payload, timeout \\ @push_timeout) do
    quote do
      Phoenix.ChannelTest.assert_push(unquote(event), unquote(payload), unquote(timeout))
    end
  end

  setup :verify_on_exit!

  setup do
    stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_700_000_000 end)
    stub(Trento.AI.Agent.Server.Mock, :get_status, fn _ -> :idle end)
    :ok
  end

  describe "join/3" do
    test "successfully joins and seeds the assigns when the token is valid" do
      jwt = generate_jwt(42)

      assert {:ok, _, socket} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => jwt
               })

      assert socket.assigns.access_token == jwt
      assert socket.assigns.current_scope == %Trento.Users.User{id: 42}
      assert socket.assigns.loading == false
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
      expect(ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      assert {:error, :ai_assistant_disabled} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42", %{
                 "access_token" => generate_jwt(42)
               })
    end

    test "prefers :ai_assistant_disabled over :unauthorized when AI is disabled with mismatched user_id" do
      expect(ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

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
      stub(ApplicationConfigLoader.Mock, :load_config, fn ->
        :trento
        |> Application.get_env(:ai, [])
        |> Keyword.put(:ai_configuration_events_adapter, AIConfigurationsEvents.Mock)
      end)

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

    test "redacts the access token from the rejected payload it logs",
         %{socket: socket, access_token: jwt} do
      log =
        capture_log(fn ->
          ref =
            push(socket, "send_message", %{
              "run_id" => "r1",
              "thread_id" => "t1",
              "access_token" => jwt
            })

          assert_reply(ref, :error, :invalid_payload)
        end)

      assert log =~ "Received invalid send_message payload:"
      assert log =~ "<REDACTED>"
      refute log =~ jwt
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

    test "ignores a stale :error when :run_has_started is false (subscribe snapshot)",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true, run_has_started: false})

      send(socket.channel_pid, {:agent, {:status_changed, :error, nil}})

      refute_push("ag_ui_event", _, 100)
      assert %{loading: true} = wait_assigns(socket)
    end

    test "emits a generic RUN_ERROR for a raw binary reason", %{socket: socket} do
      seed_assigns(socket, %{run_has_started: true})
      reason = ~s(Failed to build chain: %RuntimeError{message: "internal detail"})
      send(socket.channel_pid, {:agent, {:status_changed, :error, reason}})

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Sorry, something went wrong. Please try again."
      })
    end

    test "emits RUN_ERROR with `Sorry, ...` prefix for %LangChainError{}",
         %{socket: socket} do
      error = LangChain.LangChainError.exception(type: "x", message: "stream gone")
      seed_assigns(socket, %{run_has_started: true})
      send(socket.channel_pid, {:agent, {:status_changed, :error, error}})

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Sorry, I encountered an error: stream gone"
      })
    end

    test "emits a generic RUN_ERROR, never the raw reason", %{socket: socket} do
      seed_assigns(socket, %{run_has_started: true})
      crash = {%RuntimeError{message: "internal detail"}, [{Mod, :fun, 1, []}]}
      send(socket.channel_pid, {:agent, {:status_changed, :error, crash}})

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "Sorry, something went wrong. Please try again."
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
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, self(), make_ref()} end)
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

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _agent_id ->
        {:ok, self(), make_ref()}
      end)

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

  # The event stream does not survive an AgentServer crash, so the channel
  # monitors the server: a death mid-run must end as RUN_ERROR, not a spinner.
  describe "handle_info {:DOWN, ...} — agent server death" do
    setup :join_socket_with_ai_config

    test "emits RUN_ERROR, clears loading and expires the conversation when the agent server dies mid-run",
         %{socket: socket, access_token: jwt} do
      server_pid = spawn_fake_agent_server()

      stub_agent_run(server_pid)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r1",
        "thread_id" => "t1",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})
      assert %{loading: true} = wait_assigns(socket)

      Process.exit(server_pid, :kill)

      assert_push("ag_ui_event", %{
        "type" => "RUN_ERROR",
        "message" => "The assistant stopped unexpectedly."
      })

      assert_push("conversation_expired", %{thread_id: "t1"})
      assert %{loading: false} = wait_assigns(socket)
    end

    test "expires the conversation without a RUN_ERROR when the agent server dies with no run in flight",
         %{socket: socket, access_token: jwt} do
      server_pid = spawn_fake_agent_server()

      stub_agent_run(server_pid)

      push(socket, "send_message", %{
        "message" => "hi",
        "run_id" => "r1",
        "thread_id" => "t1",
        "access_token" => jwt
      })

      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      send(socket.channel_pid, {:agent, {:status_changed, :running, nil}})
      send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})
      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED"})

      # Inactivity shutdown of an idle AgentServer is not a failed run, but its context is gone.
      Process.exit(server_pid, :kill)

      assert_push("conversation_expired", %{thread_id: "t1"})
      refute_push("ag_ui_event", %{"type" => "RUN_ERROR"}, 100)
    end

    for action <- ["abandon_thread", :ai_configuration_cleared] do
      @action action
      test "does not expire the conversation when #{inspect(action)} stops the agent",
           %{socket: socket, access_token: jwt} do
        server_pid = spawn_fake_agent_server()

        stub_agent_run(server_pid)
        stub(Trento.AI.Agent.Server.Mock, :cancel, fn _ -> :ok end)

        expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t1" ->
          Process.exit(server_pid, :kill)
          :ok
        end)

        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => "r1",
          "thread_id" => "t1",
          "access_token" => jwt
        })

        assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

        case @action do
          "abandon_thread" -> socket |> push("abandon_thread", %{}) |> assert_reply(:ok)
          :ai_configuration_cleared -> send(socket.channel_pid, {:ai_configuration, :cleared})
        end

        refute_push("conversation_expired", _, 100)
      end
    end

    test "does not accumulate monitors across runs on the same agent server",
         %{socket: socket, access_token: jwt} do
      server_pid = spawn_fake_agent_server()

      stub_agent_run(server_pid)

      for run_id <- ["r1", "r2"] do
        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => run_id,
          "thread_id" => "t1",
          "access_token" => jwt
        })

        assert_push("ag_ui_event", %{"type" => "RUN_STARTED", "runId" => ^run_id})

        send(socket.channel_pid, {:agent, {:status_changed, :running, nil}})
        send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})
        assert_push("ag_ui_event", %{"type" => "RUN_FINISHED", "runId" => ^run_id})
      end

      {:monitors, monitors} = Process.info(socket.channel_pid, :monitors)

      assert Enum.count(monitors, &(&1 == {:process, server_pid})) == 1
    end
  end

  describe "viewer presence" do
    setup :join_socket_with_ai_config

    setup %{user_id: user_id} do
      %{thread_id: "thread-#{Faker.UUID.v4()}", viewer_id: to_string(user_id)}
    end

    test "tracks the channel as a viewer of the thread it prompts",
         %{socket: socket, access_token: jwt, thread_id: thread_id, viewer_id: viewer_id} do
      stub_agent_run(spawn_fake_agent_server())

      push_prompt(socket, jwt, thread_id)
      assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})

      assert viewer_id in viewers(thread_id)
    end

    test "stops the previous thread's agent when the client moves to another thread",
         %{socket: socket, access_token: jwt, thread_id: thread_id, viewer_id: viewer_id} do
      stub_agent_run(spawn_fake_agent_server())
      stub(Trento.AI.Agent.Server.Mock, :cancel, fn _ -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn ^thread_id -> :ok end)

      push_prompt(socket, jwt, thread_id)
      finish_run(socket)

      next_thread_id = "thread-#{Faker.UUID.v4()}"
      stub_agent_run(spawn_fake_agent_server())
      push_prompt(socket, jwt, next_thread_id)
      assert_push("ag_ui_event", %{"type" => "RUN_STARTED", "threadId" => ^next_thread_id})

      refute viewer_id in viewers(thread_id)
      assert viewer_id in viewers(next_thread_id)
    end

    for action <- ["abandon_thread", :ai_configuration_cleared] do
      @action action
      test "stops viewing the thread on #{inspect(action)}",
           %{socket: socket, access_token: jwt, thread_id: thread_id, viewer_id: viewer_id} do
        stub_agent_run(spawn_fake_agent_server())
        stub(Trento.AI.Agent.Server.Mock, :cancel, fn _ -> :ok end)
        stub(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn _ -> :ok end)

        push_prompt(socket, jwt, thread_id)
        finish_run(socket)

        case @action do
          "abandon_thread" -> socket |> push("abandon_thread", %{}) |> assert_reply(:ok)
          :ai_configuration_cleared -> send(socket.channel_pid, {:ai_configuration, :cleared})
        end

        _ = wait_assigns(socket)
        refute viewer_id in viewers(thread_id)
      end
    end

    test "tracks the thread the client names when it rejoins",
         %{user_id: user_id, thread_id: thread_id, viewer_id: viewer_id} do
      join_as_persisted_user(user_id, %{"thread_id" => thread_id})

      assert viewer_id in viewers(thread_id)
    end

    test "stops the rejoined thread's agent on abandon_thread",
         %{user_id: user_id, thread_id: thread_id, viewer_id: viewer_id} do
      %{socket: socket} = join_as_persisted_user(user_id, %{"thread_id" => thread_id})
      stub(Trento.AI.Agent.Server.Mock, :cancel, fn _ -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn ^thread_id -> :ok end)

      socket |> push("abandon_thread", %{}) |> assert_reply(:ok)

      refute viewer_id in viewers(thread_id)
    end
  end

  describe "handle_in send_message/3 — error paths before the agent starts" do
    setup :join_socket_without_ai_config

    test "emits a RUN_ERROR explaining that the user has no AI configuration",
         %{socket: socket, access_token: jwt} do
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

    test "does NOT stash run_id/thread_id when LLMBuilder errors out",
         %{socket: socket, access_token: jwt} do
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
  end

  describe "handle_in send_message/3 — error paths while the agent starts" do
    setup :join_socket_with_ai_config

    test "emits a generic RUN_ERROR when sagents start_agent_sync fails",
         %{socket: socket, access_token: jwt} do
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
        "message" => "Sorry, something went wrong. Please try again."
      })
    end

    for {name, status, message} <- [
          {"a busy agent", :running,
           "The assistant is still answering a previous message. Try again in a moment."},
          {"an unavailable registry", {:error, :registry_unavailable},
           "The assistant is restarting. Try again in a moment."}
        ] do
      @status status
      @message message
      test "explains #{name} in plain words", %{socket: socket, access_token: jwt} do
        expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
        expect(Trento.AI.Agent.Server.Mock, :get_status, fn _ -> @status end)

        push(socket, "send_message", %{
          "message" => "hi",
          "run_id" => "r1",
          "thread_id" => "t1",
          "access_token" => jwt
        })

        assert_push("ag_ui_event", %{"type" => "RUN_ERROR", "message" => @message})
      end
    end
  end

  describe "handle_in cancel_run/3" do
    setup :join_socket_with_ai_config

    test "cancels the in-flight run", %{socket: socket} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)

      ref = push(socket, "cancel_run", %{"run_id" => "r1", "thread_id" => "t-live"})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)

      # the client settles its own run
      refute_push("ag_ui_event", _payload)
    end

    test "passes through cancelling a run where there's nothing running",
         %{socket: socket} do
      seed_assigns(socket, %{loading: false, current_thread_id: "t-idle"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-idle" ->
        {:error, "Cannot cancel, server is not running (status: idle)"}
      end)

      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok
    end

    test "clears :loading and reaches no agent when no thread was ever stashed to cancel",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true})

      expect(Trento.AI.Agent.Server.Mock, :cancel, 0, fn _ ->
        :unreachable
      end)

      ref = push(socket, "cancel_run", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
    end
  end

  describe "handle_in abandon_thread/3" do
    setup :join_socket_with_ai_config

    test "abandons the thread of the in-flight run", %{socket: socket} do
      seed_assigns(socket, %{loading: true, current_thread_id: "t-live"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-live" -> :ok end)
      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-live" -> :ok end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)

      # the client settles its own run
      refute_push("ag_ui_event", _payload)
    end

    test "abandons the thread where there's nothing running",
         %{socket: socket} do
      seed_assigns(socket, %{loading: false, current_thread_id: "t-idle"})

      expect(Trento.AI.Agent.Server.Mock, :cancel, fn "t-idle" ->
        {:error, "Cannot cancel, server is not running (status: idle)"}
      end)

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn "t-idle" -> :ok end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok
    end

    test "clears :loading and reaches no agent when no thread was ever stashed to abandon",
         %{socket: socket} do
      seed_assigns(socket, %{loading: true})

      expect(Trento.AI.Agent.Server.Mock, :cancel, 0, fn _ ->
        :unreachable
      end)

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, 0, fn _ ->
        :unreachable
      end)

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert %{loading: false} = wait_assigns(socket)
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

      AIConfigurationsEvents.broadcast_cleared(user_id)

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
      # Mox raises on a stray stop_agent call.
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
        provider: :google,
        model: "gemini-2.5-pro"
      })

      assert_push("model_changed", %{provider: :google, model: "gemini-2.5-pro"})
    end
  end

  # Every describe above stops at the Mox adapter boundary proving the
  # channel calls relevant downstream functions.
  # These integration tests go all the way down the whole stack by swapping in a fake LLM implementation

  describe "Agent run cancellation — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :fake_llm]

    test "cancels the run without killing the thread's agent", %{
      socket: socket,
      access_token: jwt
    } do
      %{thread_id: thread_id} = start_run!(socket, jwt, run_id: "r1")

      pid = agent_pid!(thread_id)
      monitor = Process.monitor(pid)

      ref = push(socket, "cancel_run", %{"run_id" => "r1", "thread_id" => thread_id})

      assert_reply ref, :ok, %{}, 1_000

      refute_push("ag_ui_event", _payload, @push_timeout)

      refute_receive {:DOWN, ^monitor, :process, ^pid, _reason}, @push_timeout
      assert Process.alive?(pid)
    end

    test "lets the same thread be prompted again after the cancel", %{
      socket: socket,
      access_token: jwt
    } do
      %{thread_id: thread_id} = start_run!(socket, jwt, run_id: "r1")

      ref = push(socket, "cancel_run", %{"run_id" => "r1", "thread_id" => thread_id})
      assert_reply ref, :ok, %{}, 1_000

      push(socket, "send_message", %{
        "message" => "a follow-up prompt",
        "run_id" => "r2",
        "thread_id" => thread_id,
        "access_token" => jwt
      })

      assert_receive {:llm_called, _task_pid}, @integration_timeout

      assert_push(
        "ag_ui_event",
        %{"type" => "RUN_STARTED", "runId" => "r2", "threadId" => ^thread_id},
        @integration_timeout
      )
    end
  end

  describe "Thread abandonment/agent stopping — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :fake_llm]

    # Nobody releases the parked model, so the run task can only end by being
    # killed: a teardown that waited the run out would blow the timeouts below
    # rather than pass.
    @tag fake_llm: [block_for: :timer.minutes(1)]
    test "tears down the thread's agent mid-run", %{socket: socket, access_token: jwt} do
      %{thread_id: thread_id, task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      pid = agent_pid!(thread_id)
      monitor = Process.monitor(pid)
      task_monitor = Process.monitor(task_pid)

      ref = push(socket, "abandon_thread", %{})

      assert_reply ref, :ok, %{}, 1_000

      refute_push("ag_ui_event", _payload, @push_timeout)

      # Run *and* conversation are gone — nothing addresses this thread again.
      assert_receive {:DOWN, ^task_monitor, :process, ^task_pid, _reason}, @integration_timeout
      assert_receive {:DOWN, ^monitor, :process, ^pid, _reason}, @integration_timeout
    end

    # The run is let finish first: the agent goes back to resting with its
    # conversation still in memory — the state "New chat" leaves behind when
    # the user reads an answer before starting over.
    test "tears down a thread that is no longer streaming", %{socket: socket, access_token: jwt} do
      %{thread_id: thread_id, task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      task_monitor = Process.monitor(task_pid)

      send(task_pid, :release)

      pid = agent_pid!(thread_id)
      assert Process.alive?(pid)
      monitor = Process.monitor(pid)

      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED"}, @integration_timeout)

      # The run task is gone by answering, not by being killed.
      assert_receive {:DOWN, ^task_monitor, :process, ^task_pid, :normal}, @integration_timeout

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      assert_receive {:DOWN, ^monitor, :process, ^pid, _reason}, @integration_timeout
    end

    test "lets the next prompt through - a new run starts on the same socket", %{
      socket: socket,
      access_token: jwt
    } do
      start_run!(socket, jwt, run_id: "r1")

      ref = push(socket, "abandon_thread", %{})
      assert_reply ref, :ok

      # A new chat means a new thread id, hence a brand new agent behind it.
      new_thread_id = "thread-#{Faker.UUID.v4()}"
      stop_agent_on_exit(new_thread_id)

      push(socket, "send_message", %{
        "message" => "first prompt of the new chat",
        "run_id" => "r2",
        "thread_id" => new_thread_id,
        "access_token" => jwt
      })

      assert_push(
        "ag_ui_event",
        %{"type" => "RUN_STARTED", "runId" => "r2", "threadId" => ^new_thread_id},
        @integration_timeout
      )

      assert_receive {:llm_called, _task_pid}, @integration_timeout
    end
  end

  describe "Prompt processing — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :fake_llm]

    test "settles the run on the client and on the agent once the model answers",
         %{socket: socket, access_token: jwt} do
      %{thread_id: thread_id, task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      send(task_pid, :release)

      assert_push(
        "ag_ui_event",
        %{"type" => "RUN_FINISHED", "runId" => "r1", "threadId" => ^thread_id},
        @integration_timeout
      )

      assert %{status: :idle} = TrentoAIAgentServer.get_info(thread_id)
    end

    @tag fake_llm: [reply: ["Hello", " world"]]
    test "streams the model's deltas to the client as AG-UI text events", %{
      socket: socket,
      access_token: jwt
    } do
      %{task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      send(task_pid, :release)

      assert_push(
        "ag_ui_event",
        %{"type" => "TEXT_MESSAGE_START", "messageId" => "r1", "role" => "assistant"},
        @integration_timeout
      )

      assert_push(
        "ag_ui_event",
        %{"type" => "TEXT_MESSAGE_CONTENT", "messageId" => "r1", "delta" => "Hello"},
        @integration_timeout
      )

      assert_push(
        "ag_ui_event",
        %{"type" => "TEXT_MESSAGE_CONTENT", "messageId" => "r1", "delta" => " world"},
        @integration_timeout
      )

      assert_push(
        "ag_ui_event",
        %{"type" => "TEXT_MESSAGE_END", "messageId" => "r1"},
        @integration_timeout
      )
    end

    @tag fake_llm: [reply: {:error, "the provider said no"}]
    test "surfaces a model failure to the client as RUN_ERROR", %{
      socket: socket,
      access_token: jwt
    } do
      %{task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      send(task_pid, :release)

      assert_push(
        "ag_ui_event",
        %{"type" => "RUN_ERROR", "message" => message},
        @integration_timeout
      )

      assert message =~ "the provider said no"
    end
  end

  describe "Agent stopping on ai_configuration cleared — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :fake_llm]

    # Nobody releases the parked model, so the run task can only end by being killed
    @tag fake_llm: [block_for: :timer.minutes(1)]
    test "tears down the agent of the thread that is mid-run", %{
      socket: socket,
      access_token: jwt,
      user_id: user_id
    } do
      %{thread_id: thread_id, task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      pid = agent_pid!(thread_id)
      ref = Process.monitor(pid)
      task_monitor = Process.monitor(task_pid)

      AIConfigurationsEvents.broadcast_cleared(user_id)

      assert_receive {:DOWN, ^task_monitor, :process, ^task_pid, _reason}, @integration_timeout
      assert_receive {:DOWN, ^ref, :process, ^pid, _reason}, @integration_timeout

      assert_push("ai_configuration_cleared", %{}, @integration_timeout)
    end
  end

  describe "viewer presence — integration (real supervisor + server)" do
    @describetag :integration

    setup [:join_socket_with_ai_config, :real_sagents_adapters, :fake_llm]

    @tag ai_config_overrides: [viewer_check_delay: 50]
    test "stops the thread's idle agent once its channel goes away",
         %{socket: socket, access_token: jwt} do
      %{thread_id: thread_id, task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")
      send(task_pid, :release)
      assert_push("ag_ui_event", %{"type" => "RUN_FINISHED"}, @integration_timeout)

      agent = Process.monitor(agent_pid!(thread_id))
      refute_receive {:DOWN, ^agent, :process, _, _}, 300

      kill_channel(socket)

      assert_receive {:DOWN, ^agent, :process, _, _}, @integration_timeout
    end

    # Only the release ends the run, so the stop below cannot come from the model timing out.
    @tag ai_config_overrides: [viewer_check_delay: 50]
    @tag fake_llm: [block_for: :timer.minutes(1)]
    test "lets a run outlive its viewer and stops the agent when the run ends",
         %{socket: socket, access_token: jwt} do
      %{thread_id: thread_id, task_pid: task_pid} = start_run!(socket, jwt, run_id: "r1")

      agent = Process.monitor(agent_pid!(thread_id))
      kill_channel(socket)

      refute_receive {:DOWN, ^agent, :process, _, _}, 300
      send(task_pid, :release)

      assert_receive {:DOWN, ^agent, :process, _, _}, @integration_timeout
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

    insert(:ai_user_configuration,
      user_id: user_id,
      provider: :google,
      model: "gemini-2.5-flash"
    )

    join_as_persisted_user(user_id)
  end

  defp join_socket_without_ai_config(_context) do
    %{id: user_id} = insert(:user)

    join_as_persisted_user(user_id)
  end

  defp join_as_persisted_user(user_id, join_params \\ %{}) do
    jwt = generate_jwt(user_id)
    request_origin = "https://trento.test"

    {:ok, _, socket} =
      UserSocket
      |> socket("user_id", %{current_user_id: user_id, request_origin: request_origin})
      |> subscribe_and_join(
        AIAssistantChannel,
        "ai_assistant:#{user_id}",
        Map.put(join_params, "access_token", jwt)
      )

    Mox.allow(Trento.AI.Agent.Supervisor.Mock, self(), socket.channel_pid)
    Mox.allow(Trento.AI.Agent.Server.Mock, self(), socket.channel_pid)
    Mox.allow(Trento.AI.LLMBuilder.Mock, self(), socket.channel_pid)

    %{
      socket: socket,
      user_id: user_id,
      access_token: jwt,
      request_origin: request_origin
    }
  end

  # Pushes a prompt and blocks until the run is really inside the model call, so
  # a following `cancel_run` has something to cancel.
  #
  # `:task_pid` is the parked run task: `send(task_pid, :release)` makes the
  # fake model answer and the run complete.
  defp start_run!(socket, jwt, opts) do
    run_id = Keyword.fetch!(opts, :run_id)
    thread_id = "thread-#{Faker.UUID.v4()}"

    push(socket, "send_message", %{
      "message" => "hello",
      "run_id" => run_id,
      "thread_id" => thread_id,
      "access_token" => jwt
    })

    assert_push(
      "ag_ui_event",
      %{"type" => "RUN_STARTED", "runId" => ^run_id, "threadId" => ^thread_id},
      @integration_timeout
    )

    assert_receive {:llm_called, task_pid}, @integration_timeout

    stop_agent_on_exit(thread_id)

    %{thread_id: thread_id, task_pid: task_pid}
  end

  # A killed channel skips every callback, so only presence notices it is gone.
  defp kill_channel(%{channel_pid: channel_pid}) do
    Process.unlink(channel_pid)
    ref = Process.monitor(channel_pid)
    Process.exit(channel_pid, :kill)
    assert_receive {:DOWN, ^ref, :process, _, :killed}
  end

  # Stands in for the AgentServer: the channel only monitors it.
  defp spawn_fake_agent_server do
    pid = spawn(fn -> Process.sleep(:infinity) end)
    on_exit(fn -> Process.exit(pid, :kill) end)

    pid
  end

  # Stubs the Agent.run/3 adapter chain to report `server_pid`, for any number of runs.
  defp stub_agent_run(server_pid) do
    stub(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, server_pid} end)
    stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
    stub(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:ok, server_pid, make_ref()} end)
    stub(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)
  end

  defp push_prompt(socket, jwt, thread_id) do
    push(socket, "send_message", %{
      "message" => "hi",
      "run_id" => "run-#{Faker.UUID.v4()}",
      "thread_id" => thread_id,
      "access_token" => jwt
    })
  end

  defp finish_run(socket) do
    assert_push("ag_ui_event", %{"type" => "RUN_STARTED"})
    send(socket.channel_pid, {:agent, {:status_changed, :running, nil}})
    send(socket.channel_pid, {:agent, {:status_changed, :idle, nil}})
    assert_push("ag_ui_event", %{"type" => "RUN_FINISHED"})
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
