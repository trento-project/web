# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AgentTest do
  use ExUnit.Case, async: false
  use Trento.AI.AICase

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

    test "populates base_system_prompt by reading the file at the configured path" do
      model = build(:random_langchain_model)
      scope = build(:user)

      expected =
        :trento
        |> Application.app_dir("priv/ai/BASE_SYSTEM_PROMPT.md")
        |> File.read!()

      agent = TrentoAIAgent.new!(agent_id: "thread-1", model: model, scope: scope)

      assert %Sagents.Agent{base_system_prompt: ^expected} = agent
    end

    test "raises File.Error when the configured path does not exist" do
      model = build(:random_langchain_model)
      scope = build(:user)

      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn ->
        [base_system_prompt: "priv/ai/does_not_exist.md"]
      end)

      assert_raise File.Error, fn ->
        TrentoAIAgent.new!(agent_id: "thread-1", model: model, scope: scope)
      end
    end

    test "raises KeyError when :base_system_prompt is missing from config" do
      model = build(:random_langchain_model)
      scope = build(:user)

      expect(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [] end)

      assert_raise KeyError, fn ->
        TrentoAIAgent.new!(agent_id: "thread-1", model: model, scope: scope)
      end
    end
  end

  describe "run/2" do
    setup :run_opts

    test "returns :ok when start_agent_sync, subscribe, and add_message all succeed",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      test_pid = self()

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn start_opts ->
        send(test_pid, {:start_agent_sync, start_opts})
        {:ok, self()}
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn ^agent_id -> :ok end)

      expect(Trento.AI.Agent.Server.Mock, :add_message, fn ^agent_id,
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
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ ->
        {:error, :boom}
      end)

      assert {:error, :boom} = TrentoAIAgent.run(agent, prompt)
    end

    test "short-circuits when subscribe fails (add_message NOT called)",
         %{agent: agent, prompt: prompt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:error, :no_pubsub} end)

      assert {:error, :no_pubsub} = TrentoAIAgent.run(agent, prompt)
    end

    test "surfaces an add_message failure", %{agent: agent, prompt: prompt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> {:error, :timeout} end)

      assert {:error, :timeout} = TrentoAIAgent.run(agent, prompt)
    end
  end

  describe "run/2 — refresh_agent_context" do
    setup :run_opts_with_token

    test "skips update_agent_and_state when AgentServer already holds the same token",
         %{agent: agent, agent_id: agent_id, prompt: prompt, token: token} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id ->
        {:ok, %{tool_context: %{access_token: token}}}
      end)

      # get_state and update_agent_and_state must NOT be called
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt)
    end

    test "calls update_agent_and_state when AgentServer holds a stale token",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id ->
        {:ok, %{tool_context: %{access_token: "old_stale_token"}}}
      end)

      state = %Sagents.State{agent_id: agent_id}
      expect(Trento.AI.Agent.Server.Mock, :get_state, fn ^agent_id -> state end)

      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn ^agent_id, ^agent, ^state ->
        :ok
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt)
    end

    test "skips update_agent_and_state when the AgentServer is not yet running",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id ->
        {:error, :not_found}
      end)

      # get_state and update_agent_and_state must NOT be called
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt)
    end
  end

  defp run_opts(_ctx) do
    agent_id = "thread-#{Faker.UUID.v4()}"
    model = build(:random_langchain_model)
    scope = build(:user)
    agent = TrentoAIAgent.new!(agent_id: agent_id, model: model, scope: scope)

    %{agent: agent, agent_id: agent_id, prompt: "hello"}
  end

  defp run_opts_with_token(_ctx) do
    agent_id = "thread-#{Faker.UUID.v4()}"
    token = "jwt-#{Faker.UUID.v4()}"
    model = build(:random_langchain_model)
    scope = build(:user)

    agent =
      TrentoAIAgent.new!(
        agent_id: agent_id,
        model: model,
        scope: scope,
        tool_context: %{access_token: token}
      )

    %{agent: agent, agent_id: agent_id, token: token, prompt: "hello"}
  end
end
