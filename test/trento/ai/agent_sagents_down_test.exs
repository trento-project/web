# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AgentSagentsDownTest do
  # Not async: stopping the node's sagents tree would break every concurrent agent test.
  use ExUnit.Case, async: false
  use Trento.AI.AICase

  import Trento.Factory

  alias Trento.AI.Agent, as: TrentoAIAgent
  alias Trento.AI.FakeChatModel

  @moduletag :integration

  setup :real_sagents_adapters

  setup do
    :ok = Supervisor.terminate_child(Trento.Supervisor, Sagents.Supervisor)

    on_exit(fn ->
      {:ok, _} = Supervisor.restart_child(Trento.Supervisor, Sagents.Supervisor)
    end)
  end

  test "run/3 fails the run instead of exiting" do
    agent_id = "thread-#{Faker.UUID.v4()}"

    agent =
      TrentoAIAgent.new!(
        agent_id: agent_id,
        model: %FakeChatModel{notify: self()},
        scope: build(:user)
      )

    assert {:error, :registry_unavailable} = TrentoAIAgent.run(agent, "hello")
  end
end
