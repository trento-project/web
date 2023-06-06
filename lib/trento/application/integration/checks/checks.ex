defmodule Trento.Integration.Checks do
  @moduledoc """
  Checks runner service integration
  """

  alias Trento.Infrastructure.Messaging

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  alias Trento.Integration.Checks.ClusterExecutionEnv

  require Logger

  @spec request_execution(String.t(), String.t(), ClusterExecutionEnv.t(), [map], [String.t()]) ::
          :ok | {:error, :any}
  def request_execution(execution_id, cluster_id, env, hosts, selected_checks) do
    execution_requested =
      ExecutionRequested.new!(
        execution_id: execution_id,
        group_id: cluster_id,
        targets:
          Enum.map(hosts, fn %{host_id: host_id} ->
            Target.new!(agent_id: host_id, checks: selected_checks)
          end),
        env: build_env(env)
      )

    case Messaging.publish("executions", execution_requested) do
      :ok ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to publish message to topic executions: #{inspect(reason)}")

        error
    end
  end

  defp build_env(%ClusterExecutionEnv{cluster_type: cluster_type, provider: provider}) do
    %{
      "cluster_type" => %{kind: {:string_value, Atom.to_string(cluster_type)}},
      "provider" => %{kind: {:string_value, Atom.to_string(provider)}}
    }
  end
end
