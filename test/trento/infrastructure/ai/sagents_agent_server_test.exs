# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.SagentsAgentServerTest do
  # Not async: these tests take the node's sagents tree down, which every other
  # test touching an agent would see. ExUnit runs synchronous modules on their
  # own, once the async ones are done.
  use ExUnit.Case, async: false

  alias Trento.Infrastructure.AI.SagentsAgentServer

  setup do
    %{
      agent_id: "thread-#{Faker.UUID.v4()}",
      agent: %Sagents.Agent{agent_id: "thread-1"},
      state: %Sagents.State{agent_id: "thread-1"}
    }
  end

  describe "when this node's sagents tree is down" do
    setup do
      :ok = Supervisor.terminate_child(Trento.Supervisor, Sagents.Supervisor)

      on_exit(fn ->
        {:ok, _} = Supervisor.restart_child(Trento.Supervisor, Sagents.Supervisor)
      end)

      refute Sagents.ProcessRegistry.available?()

      :ok
    end

    test "get_agent/1 answers {:error, :registry_unavailable} instead of raising",
         %{agent_id: agent_id} do
      assert {:error, :registry_unavailable} = SagentsAgentServer.get_agent(agent_id)
    end

    test "get_info/1 answers {:error, :registry_unavailable} instead of raising",
         %{agent_id: agent_id} do
      assert {:error, :registry_unavailable} = SagentsAgentServer.get_info(agent_id)
    end

    test "update_agent_and_state/3 answers {:error, :registry_unavailable} instead of raising",
         %{agent_id: agent_id, agent: agent, state: state} do
      assert {:error, :registry_unavailable} =
               SagentsAgentServer.update_agent_and_state(agent_id, agent, state)
    end
  end

  describe "when this node's sagents tree is up" do
    test "the rescue does not shadow the ordinary not-found answer",
         %{agent_id: agent_id} do
      assert Sagents.ProcessRegistry.available?()

      assert {:error, :not_found} = SagentsAgentServer.get_agent(agent_id)
    end
  end
end
