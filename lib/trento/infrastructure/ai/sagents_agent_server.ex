# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.SagentsAgentServer do
  @moduledoc """
  Production implementation of `Trento.AI.Agent.Server` —
  delegates to `Sagents.AgentServer`.
  """

  @behaviour Trento.AI.Agent.Server

  @impl Trento.AI.Agent.Server
  defdelegate subscribe(agent_id), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  defdelegate add_message(agent_id, message), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  defdelegate get_agent(agent_id), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  defdelegate get_info(agent_id), to: Sagents.AgentServer

  @impl Trento.AI.Agent.Server
  defdelegate update_agent_and_state(agent_id, agent, state), to: Sagents.AgentServer
end
