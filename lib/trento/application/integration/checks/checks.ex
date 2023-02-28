defmodule Trento.Integration.Checks do
  @moduledoc """
  Checks runner service integration
  """

  alias Trento.Domain.Enums.Provider
  alias Trento.Infrastructure.Messaging

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  require Logger

  @spec request_execution(String.t(), String.t(), Provider.t(), [map], [String.t()]) ::
          :ok | {:error, :request_execution_failed}
  def request_execution(execution_id, cluster_id, provider, hosts, selected_checks) do
    execution_requested =
      ExecutionRequested.new!(
        execution_id: execution_id,
        group_id: cluster_id,
        targets:
          Enum.map(hosts, fn %{host_id: host_id} ->
            Target.new!(agent_id: host_id, checks: selected_checks)
          end),
        env: %{"provider" => %{kind: {:string_value, Atom.to_string(provider)}}}
      )

    case Messaging.publish("executions", execution_requested) do
      :ok ->
        :ok

      {:error, reason} ->
        Logger.error("Failed to publish message to topic executions: #{inspect(reason)}")

        {:error, :request_execution_failed}
    end
  end
end
