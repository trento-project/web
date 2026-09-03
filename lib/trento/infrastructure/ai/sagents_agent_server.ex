# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.SagentsAgentServer do
  @moduledoc """
  Production implementation of `Trento.AI.Agent.Server` —
  delegates to `Sagents.AgentServer`.

  Half of that API cannot report an unreachable registry in its return value, so
  it raises `Sagents.RegistryUnavailableError` instead: `get_info/1` and
  `update_agent_and_state/3` through sagents' `call!/3`, `get_agent/1` through
  `Sagents.AgentServer.get_pid/1`. That happens while the BEAM drains — the
  registry's ETS table goes with `Sagents.Supervisor`, and the endpoint keeps
  serving for the rest of the platform's drain period.

  Turning the raise back into `{:error, :registry_unavailable}` belongs here:
  the behaviour's contract is a tagged tuple, and normalizing a library's
  signalling to it is what an adapter is for. Left to propagate, the exception
  would take the assistant channel down instead of ending the run with
  `RUN_ERROR`.
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
  def get_agent(agent_id) do
    Sagents.AgentServer.get_agent(agent_id)
  rescue
    RegistryUnavailableError -> {:error, :registry_unavailable}
  end

  @impl Trento.AI.Agent.Server
  def get_info(agent_id) do
    Sagents.AgentServer.get_info(agent_id)
  rescue
    RegistryUnavailableError -> {:error, :registry_unavailable}
  end

  @impl Trento.AI.Agent.Server
  def update_agent_and_state(agent_id, agent, state) do
    Sagents.AgentServer.update_agent_and_state(agent_id, agent, state)
  rescue
    RegistryUnavailableError -> {:error, :registry_unavailable}
  end
end
