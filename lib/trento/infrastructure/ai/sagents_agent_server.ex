# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.SagentsAgentServer do
  @moduledoc """
  Production implementation of `Trento.AI.Agent.Server` —
  delegates to `Sagents.AgentServer`.

  `get_agent/1`, `get_info/1`, `get_status/1` and `update_agent_and_state/3` raise
  `Sagents.RegistryUnavailableError` once this node's sagents tree is down, for example while the node drains.
  They are rescued into `{:error, :registry_unavailable}`, as the behaviour requires.
  """

  @behaviour Trento.AI.Agent.Server

  alias Sagents.RegistryUnavailableError

  @impl Trento.AI.Agent.Server
  defdelegate subscribe(agent_id), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  defdelegate add_message(agent_id, message), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  defdelegate cancel(agent_id), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  def get_agent(agent_id),
    do: rescue_registry_unavailable(fn -> Sagents.AgentServer.get_agent(agent_id) end)

  @impl Trento.AI.Agent.Server
  def get_info(agent_id),
    do: rescue_registry_unavailable(fn -> Sagents.AgentServer.get_info(agent_id) end)

  @impl Trento.AI.Agent.Server
  def get_status(agent_id),
    do: rescue_registry_unavailable(fn -> Sagents.AgentServer.get_status(agent_id) end)

  @impl Trento.AI.Agent.Server
  def update_agent_and_state(agent_id, agent, state),
    do:
      rescue_registry_unavailable(fn ->
        Sagents.AgentServer.update_agent_and_state(agent_id, agent, state)
      end)

  defp rescue_registry_unavailable(fun) do
    fun.()
  rescue
    RegistryUnavailableError -> {:error, :registry_unavailable}
  end
end
