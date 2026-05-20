# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AgentTest do
  use ExUnit.Case, async: false

  import Mox

  import Trento.Factory

  alias LangChain.Message
  alias Sagents.Middleware.{PatchToolCalls, Summarization, TodoList}
  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.Users.User

  setup :verify_on_exit!

  describe "new!/1" do
    test "builds a %Sagents.Agent{} with the supplied agent_id, scope, and model" do
      model = build(:random_langchain_model)
      scope = build(:user)

      assert %Sagents.Agent{
               agent_id: "thread-1",
               scope: ^scope,
               model: ^model
             } = TrentoAIAgent.new!(agent_id: "thread-1", model: model, scope: scope)
    end

    test "uses only TodoList + Summarization + PatchToolCalls middleware" do
      model = build(:random_langchain_model)
      scope = %User{id: 42}

      agent = TrentoAIAgent.new!(agent_id: "thread-1", model: model, scope: scope)

      modules = Enum.map(agent.middleware, & &1.module)

      assert TodoList in modules
      assert Summarization in modules
      assert PatchToolCalls in modules
      refute Sagents.Middleware.FileSystem in modules
      refute Sagents.Middleware.SubAgent in modules
      refute Sagents.Middleware.HumanInTheLoop in modules
    end
  end

  describe "run/2" do
    setup :run_opts

    test "returns :ok when start_agent_sync, subscribe, and add_message all succeed",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      test_pid = self()

      expect(Trento.AI.Agent.SupervisorAdapter.Mock, :start_agent_sync, fn start_opts ->
        send(test_pid, {:start_agent_sync, start_opts})
        {:ok, self()}
      end)

      expect(Trento.AI.Agent.ServerAdapter.Mock, :subscribe, fn ^agent_id -> :ok end)

      expect(Trento.AI.Agent.ServerAdapter.Mock, :add_message, fn ^agent_id,
                                                                  %Message{role: :user} = msg ->
        send(test_pid, {:add_message, msg})
        :ok
      end)

      assert :ok = TrentoAIAgent.run(agent, prompt)

      assert_received {:start_agent_sync, start_opts}
      assert Keyword.fetch!(start_opts, :agent_id) == agent_id
      assert Keyword.fetch!(start_opts, :pubsub) == {Phoenix.PubSub, Trento.PubSub}

      assert_received {:add_message, %Message{content: [%{content: "hello"}]}}
    end

    test "short-circuits when start_agent_sync fails (subscribe + add_message NOT called)",
         %{agent: agent, prompt: prompt} do
      expect(Trento.AI.Agent.SupervisorAdapter.Mock, :start_agent_sync, fn _ ->
        {:error, :boom}
      end)

      assert {:error, :boom} = TrentoAIAgent.run(agent, prompt)
    end

    test "short-circuits when subscribe fails (add_message NOT called)",
         %{agent: agent, prompt: prompt} do
      expect(Trento.AI.Agent.SupervisorAdapter.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(Trento.AI.Agent.ServerAdapter.Mock, :subscribe, fn _ -> {:error, :no_pubsub} end)

      assert {:error, :no_pubsub} = TrentoAIAgent.run(agent, prompt)
    end

    test "surfaces an add_message failure", %{agent: agent, prompt: prompt} do
      expect(Trento.AI.Agent.SupervisorAdapter.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(Trento.AI.Agent.ServerAdapter.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.ServerAdapter.Mock, :add_message, fn _, _ -> {:error, :timeout} end)

      assert {:error, :timeout} = TrentoAIAgent.run(agent, prompt)
    end
  end

  defp run_opts(_ctx) do
    agent_id = "thread-#{Faker.UUID.v4()}"
    model = build(:random_langchain_model)
    scope = build(:user)
    agent = TrentoAIAgent.new!(agent_id: agent_id, model: model, scope: scope)

    %{agent: agent, agent_id: agent_id, prompt: "hello"}
  end
end
