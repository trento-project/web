# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AgentTest do
  use ExUnit.Case, async: false
  use Trento.AI.AICase

  import Mox

  import Trento.Factory

  alias LangChain.Message
  alias Sagents.AgentSupervisor
  alias Sagents.Middleware.{PatchToolCalls, Summarization, TodoList}
  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.AI.Agent.Supervisor, as: TrentoAIAgentSupervisor
  alias Trento.Infrastructure.AI.SagentsDynamicSupervisor
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

      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
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
      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> {:error, :no_pubsub} end)

      assert {:error, :no_pubsub} = TrentoAIAgent.run(agent, prompt)
    end

    test "surfaces an add_message failure", %{agent: agent, prompt: prompt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _ -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _ -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn _, _ -> {:error, :timeout} end)

      assert {:error, :timeout} = TrentoAIAgent.run(agent, prompt)
    end
  end

  describe "run/3 — refresh_when callback" do
    setup :run_opts

    test "invokes update_agent_and_state with the updated agent + current state when refresh_when returns {:ok, updated}",
         %{agent: %Sagents.Agent{} = agent, agent_id: agent_id, prompt: prompt} do
      current_agent = %Sagents.Agent{agent_id: agent_id, tool_context: %{flag: :current}}
      updated_agent = %{agent | tool_context: %{flag: :updated}}
      state = %Sagents.State{agent_id: agent_id}
      test_pid = self()

      refresh_when = fn current, new_agent ->
        send(test_pid, {:refresh_when, current, new_agent})
        {:ok, updated_agent}
      end

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id -> {:ok, current_agent} end)
      expect(Trento.AI.Agent.Server.Mock, :get_info, fn ^agent_id -> %{state: state} end)

      expect(Trento.AI.Agent.Server.Mock, :update_agent_and_state, fn ^agent_id,
                                                                      ^updated_agent,
                                                                      ^state ->
        :ok
      end)

      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn ^agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn ^agent_id, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt, refresh_when: refresh_when)

      assert_received {:refresh_when, ^current_agent, ^agent}
    end

    test "skips update_agent_and_state when refresh_when returns :noop",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      refresh_when = fn _current, _new_agent -> :noop end

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id ->
        {:ok, %Sagents.Agent{agent_id: agent_id}}
      end)

      # No get_info / update_agent_and_state expectations —
      # verify_on_exit! catches strays.
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn ^agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn ^agent_id, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt, refresh_when: refresh_when)
    end

    test "does not invoke refresh_when when AgentServer is not yet running",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      refresh_when = fn _, _ ->
        raise "refresh_when must not be called when no current agent exists"
      end

      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)
      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id -> {:error, :not_found} end)
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn ^agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn ^agent_id, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt, refresh_when: refresh_when)
    end

    test "default refresh_when (no opt) never triggers update_agent_and_state",
         %{agent: agent, agent_id: agent_id, prompt: prompt} do
      expect(Trento.AI.Agent.Supervisor.Mock, :start_agent_sync, fn _ -> {:ok, self()} end)

      expect(Trento.AI.Agent.Server.Mock, :get_agent, fn ^agent_id ->
        {:ok, %Sagents.Agent{agent_id: agent_id}}
      end)

      # default_refresh_when/2 returns :noop unconditionally;
      # no get_info / update_agent_and_state expectations.
      expect(Trento.AI.Agent.Server.Mock, :subscribe, fn ^agent_id -> :ok end)
      expect(Trento.AI.Agent.Server.Mock, :add_message, fn ^agent_id, _ -> :ok end)

      assert :ok = TrentoAIAgent.run(agent, prompt)
    end
  end

  describe "stop/1" do
    test "delegates to the supervisor's stop_agent/1" do
      agent_id = "thread-#{Faker.UUID.v4()}"

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn ^agent_id -> :ok end)

      assert :ok = TrentoAIAgent.stop(agent_id)
    end

    test "propagates the supervisor's error verbatim (nothing running)" do
      agent_id = "thread-#{Faker.UUID.v4()}"

      expect(Trento.AI.Agent.Supervisor.Mock, :stop_agent, fn ^agent_id ->
        {:error, :not_found}
      end)

      assert {:error, :not_found} = TrentoAIAgent.stop(agent_id)
    end
  end

  # Exercises the real Sagents supervisor tree through the public API,
  # proving that a genuinely running agent process is actually terminated
  # the mock tests above only prove the call is wired.
  #
  # The test adapters are mocks (see test_helper.exs), so this describe swaps the
  # supervisor adapter for the real SagentsDynamicSupervisor for its duration.
  describe "stop/1 — integration (real supervisor)" do
    @describetag :integration

    setup do
      ai = Application.get_env(:trento, :ai)

      Application.put_env(
        :trento,
        :ai,
        Keyword.put(ai, :agent_supervisor_adapter, SagentsDynamicSupervisor)
      )

      on_exit(fn -> Application.put_env(:trento, :ai, ai) end)
    end

    test "terminates the running agent's process tree" do
      agent_id = "thread-#{Faker.UUID.v4()}"

      agent =
        TrentoAIAgent.new!(
          agent_id: agent_id,
          model: build(:random_langchain_model),
          scope: build(:user)
        )

      assert {:ok, _sup} =
               TrentoAIAgentSupervisor.start_agent_sync(
                 agent_id: agent_id,
                 agent: agent,
                 pubsub: {Phoenix.PubSub, Trento.PubSub}
               )

      assert {:ok, pid} = AgentSupervisor.get_pid(agent_id)
      assert Process.alive?(pid)
      ref = Process.monitor(pid)

      assert :ok = TrentoAIAgent.stop(agent_id)

      # DOWN + not-alive prove the process tree is gone.
      # Deliberately not assertin on AgentSupervisor.get_pid/1
      # the registry unregisters via its own monitor, asynchronously,
      # so it can still return the stale entry right after DOWN.
      assert_receive {:DOWN, ^ref, :process, ^pid, _reason}, 5_000
      refute Process.alive?(pid)
    end

    test "returns {:error, :not_found} when no agent is running for the id" do
      assert {:error, :not_found} = TrentoAIAgent.stop("thread-#{Faker.UUID.v4()}")
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
