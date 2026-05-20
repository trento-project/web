# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Agent.SupervisorAdapter do
  @moduledoc """
  Behaviour wrapping `Sagents.AgentsDynamicSupervisor.start_agent_sync/1`.
  Configurable via `:ai_sagents_supervisor_adapter` so tests can
  substitute a Mox mock.
  """

  @doc """
  Start an agent supervisor synchronously.

  Sagents.AgentsDynamicSupervisor.start_agent_sync/1 spec declares

  @spec start_agent_sync(keyword()) ::
          {:ok, pid()} | {:ok, pid(), :already_started} | {:error, term()}

  however, the `:already_started` case is not actually returned by the implementation.
  """
  @callback start_agent_sync(keyword()) :: {:ok, pid()} | {:error, term()}

  def start_agent_sync(opts), do: impl().start_agent_sync(opts)

  defp impl,
    do:
      Application.get_env(
        :trento,
        :ai_sagents_supervisor_adapter,
        __MODULE__.SagentsDynamicSupervisor
      )

  defmodule SagentsDynamicSupervisor do
    @moduledoc false
    @behaviour Trento.AI.Agent.SupervisorAdapter

    defdelegate start_agent_sync(opts), to: Sagents.AgentsDynamicSupervisor
  end
end
