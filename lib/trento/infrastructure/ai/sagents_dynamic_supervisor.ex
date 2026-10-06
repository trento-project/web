# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.SagentsDynamicSupervisor do
  @moduledoc """
  Production implementation of `Trento.AI.Agent.Supervisor` —
  delegates to `Sagents.AgentsDynamicSupervisor`.

  `start_agent_sync/1` exits once this node's sagents tree is down, for
  example while the node drains. The exit is caught into
  `{:error, :registry_unavailable}`.
  """

  @behaviour Trento.AI.Agent.Supervisor

  @impl Trento.AI.Agent.Supervisor
  def start_agent_sync(opts) do
    Sagents.AgentsDynamicSupervisor.start_agent_sync(opts)
  catch
    :exit, {:noproc, {GenServer, :call, [Sagents.AgentsDynamicSupervisor | _]}} ->
      {:error, :registry_unavailable}
  end

  @impl Trento.AI.Agent.Supervisor
  defdelegate stop_agent(agent_id), to: Sagents.AgentsDynamicSupervisor
end
