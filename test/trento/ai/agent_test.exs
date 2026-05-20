# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AgentTest do
  use ExUnit.Case, async: false

  import Mox

  alias LangChain.ChatModels.ChatGoogleAI
  alias LangChain.LangChainError
  alias LangChain.Message
  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.AI.Agent.{ServerAdapter, SupervisorAdapter}
  alias Trento.Users.User

  setup :verify_on_exit!

  describe "format_error/1" do
    test "renders a %LangChainError{}'s message inline" do
      error = LangChainError.exception(type: "boom", message: "stream gone")

      assert TrentoAIAgent.format_error(error) ==
               "Sorry, I encountered an error: stream gone"
    end

    test "inspects an arbitrary atom reason" do
      assert TrentoAIAgent.format_error(:timeout) ==
               "Sorry, I encountered an error: :timeout"
    end

    test "inspects an arbitrary tuple reason" do
      assert TrentoAIAgent.format_error({:err, "boom"}) ==
               "Sorry, I encountered an error: {:err, \"boom\"}"
    end
  end

  describe "run/1" do
    setup [:override_adapters, :run_opts]

    test "returns :ok when start_agent_sync, subscribe, and add_message all succeed",
         %{opts: opts, agent_id: agent_id} do
      test_pid = self()

      expect(SupervisorAdapter.Mock, :start_agent_sync, fn start_opts ->
        send(test_pid, {:start_agent_sync, start_opts})
        {:ok, self()}
      end)

      expect(ServerAdapter.Mock, :subscribe, fn ^agent_id -> :ok end)

      expect(ServerAdapter.Mock, :add_message, fn ^agent_id, %Message{role: :user} = msg ->
        send(test_pid, {:add_message, msg})
        :ok
      end)

      assert :ok = TrentoAIAgent.run(opts)

      assert_received {:start_agent_sync, start_opts}
      assert Keyword.fetch!(start_opts, :agent_id) == agent_id
      assert Keyword.fetch!(start_opts, :pubsub) == {Phoenix.PubSub, Trento.PubSub}

      assert_received {:add_message, %Message{content: [%{content: "hello"}]}}
    end

    test "short-circuits when start_agent_sync fails (subscribe + add_message NOT called)",
         %{opts: opts} do
      expect(SupervisorAdapter.Mock, :start_agent_sync, fn _ -> {:error, :boom} end)

      assert {:error, :boom} = TrentoAIAgent.run(opts)
    end

    test "short-circuits when subscribe fails (add_message NOT called)", %{opts: opts} do
      expect(SupervisorAdapter.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(ServerAdapter.Mock, :subscribe, fn _ -> {:error, :no_pubsub} end)

      assert {:error, :no_pubsub} = TrentoAIAgent.run(opts)
    end

    test "surfaces an add_message failure", %{opts: opts} do
      expect(SupervisorAdapter.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(ServerAdapter.Mock, :subscribe, fn _ -> :ok end)
      expect(ServerAdapter.Mock, :add_message, fn _, _ -> {:error, :timeout} end)

      assert {:error, :timeout} = TrentoAIAgent.run(opts)
    end
  end

  # ----------------------------------------------------------------
  # Setup helpers
  # ----------------------------------------------------------------

  defp run_opts(_ctx) do
    agent_id = "thread-#{System.unique_integer([:positive])}"
    model = ChatGoogleAI.new!(%{model: "gemini-2.5-flash", api_key: "x", stream: true})
    scope = %User{id: 42}

    %{
      opts: [agent_id: agent_id, model: model, scope: scope, prompt: "hello"],
      agent_id: agent_id
    }
  end

  # Per-test override of the sagents adapter env so the Mox doubles take
  # effect only for the current test. NOT done globally in test_helper.exs
  # because other tests in the suite must continue to route to the real
  # sagents impl (default adapter).
  defp override_adapters(_ctx) do
    # prev_server = Application.get_env(:trento, :ai_sagents_server_adapter)
    # prev_supervisor = Application.get_env(:trento, :ai_sagents_supervisor_adapter)

    # Application.put_env(:trento, :ai_sagents_server_adapter, ServerAdapter.Mock)
    # Application.put_env(:trento, :ai_sagents_supervisor_adapter, SupervisorAdapter.Mock)

    # on_exit(fn ->
    #   restore_env(:ai_sagents_server_adapter, prev_server)
    #   restore_env(:ai_sagents_supervisor_adapter, prev_supervisor)
    # end)

    :ok
  end

  defp restore_env(key, nil), do: Application.delete_env(:trento, key)
  defp restore_env(key, value), do: Application.put_env(:trento, key, value)
end
