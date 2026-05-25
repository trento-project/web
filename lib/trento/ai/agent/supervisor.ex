# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Agent.Supervisor do
  @moduledoc """
  Behaviour wrapping `Sagents.AgentsDynamicSupervisor.start_agent_sync/1`.

  Default production implementation lives at
  `Trento.Infrastructure.AI.SagentsDynamicSupervisor`. Override via the
  `:trento, :ai, agent_supervisor_adapter:` config so tests can
  substitute a Mox mock.
  """

  alias Trento.AI.ApplicationConfigLoader

  @doc """
  Start an agent supervisor synchronously.

  Sagents.AgentsDynamicSupervisor.start_agent_sync/1 spec declares

  @spec start_agent_sync(keyword()) ::
          {:ok, pid()} | {:ok, pid(), :already_started} | {:error, term()}

  however, the `:already_started` case is not actually returned by the implementation.
  """
  @callback start_agent_sync(keyword()) :: {:ok, pid()} | {:error, term()}

  def start_agent_sync(opts), do: impl().start_agent_sync(opts)

  defp impl, do: Keyword.get(ApplicationConfigLoader.load(), :agent_supervisor_adapter)
end
