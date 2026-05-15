# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantChannelTest do
  @moduledoc """
  Channel tests covering the surface that doesn't require deep mocking of
  AgenticRuntime adapters or DB-backed AI configuration.

  Deferred (separate test pass — see plan valiant-twirling-crown):
    - send_message happy path (needs Mox setup for ServerAdapter / SupervisorAdapter
      and a Conversation factory).
    - AG-UI event payload assertions (requires AG-UI helpers).
    - Streaming path (llm_deltas, tool_call_identified, display_message_saved/updated).
  """

  use TrentoWeb.ChannelCase

  alias TrentoWeb.AIAssistantChannel
  alias TrentoWeb.UserSocket

  describe "join/3" do
    test "joins ai_assistant:<user_id> when current_user_id matches" do
      assert {:ok, _, socket} =
               UserSocket
               |> socket("user_id", %{current_user_id: 42})
               |> subscribe_and_join(AIAssistantChannel, "ai_assistant:42")

      assert socket.assigns.current_scope == %Trento.Users.User{id: 42}
      # assert socket.assigns.timezone == "UTC"
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

  describe "handle_in send_message/3" do
    setup do
      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: 7})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:7")

      %{socket: socket}
    end

    test "ignores empty message text", %{socket: socket} do
      ref = push(socket, "send_message", %{"message" => ""})
      refute_reply ref, _, 100
      refute_push "agent_error", _, 100
    end

    test "ignores whitespace-only message text", %{socket: socket} do
      ref = push(socket, "send_message", %{"message" => "   \n\t  "})
      refute_reply ref, _, 100
      refute_push "agent_error", _, 100
    end
  end

  describe "handle_in new_thread/3" do
    setup do
      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: 7})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:7")

      %{socket: socket}
    end

    test "pushes agent_info confirming the new conversation", %{socket: socket} do
      push(socket, "new_thread", %{})
      assert_push "agent_info", %{message: "New conversation started"}
    end
  end

  describe "handle_info status events" do
    setup do
      {:ok, _, socket} =
        UserSocket
        |> socket("user_id", %{current_user_id: 7})
        |> subscribe_and_join(AIAssistantChannel, "ai_assistant:7")

      %{socket: socket}
    end

    test "pushes agent-execution-cancelled when agent fires :cancelled", %{socket: socket} do
      send(socket.channel_pid, {:agent, {:status_changed, :cancelled, nil}})
      assert_push "agent-execution-cancelled", %{}
    end
  end
end
