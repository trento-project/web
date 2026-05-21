# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.SagentsDynamicSupervisor do
  @moduledoc """
  Production implementation of `Trento.AI.Agent.Supervisor` —
  delegates to `Sagents.AgentsDynamicSupervisor`.
  """

  @behaviour Trento.AI.Agent.Supervisor

  @impl Trento.AI.Agent.Supervisor
  defdelegate start_agent_sync(opts), to: Sagents.AgentsDynamicSupervisor
end
