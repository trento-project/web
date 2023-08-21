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
  alias Trento.Integration.Checks.HostExecutionEnv

  require Logger

  @spec request_execution(String.t(), String.t(), ClusterExecutionEnv.t(), [map], [String.t()]) ::
          :ok | {:error, :any}
  def request_execution(execution_id, cluster_id, env, hosts, selected_checks) do
    IO.inspect("request_execution")
    IO.inspect(env)

    execution_requested = %ExecutionRequested{
      execution_id: execution_id,
      group_id: cluster_id,
      targets:
        Enum.map(hosts, fn %{host_id: host_id} ->
          %Target{agent_id: host_id, checks: selected_checks}
        end),
      env: build_env(env)
    }

    case Messaging.publish("executions", execution_requested) do
      :ok ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to publish message to topic executions: #{inspect(reason)}")

        error
    end
  end

  def request_host_execution(execution_id, host_id, env, selected_checks) do
    IO.inspect("request_host_execution")

    execution_requested = %ExecutionRequested{
      execution_id: execution_id,
      group_id: host_id,
      targets: [%Target{agent_id: host_id, checks: selected_checks}],
      env: build_host_env(env)
    }

    IO.inspect(execution_requested)

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

  defp build_host_env(%HostExecutionEnv{provider: provider}) do
    %{
      "provider" => %{kind: {:string_value, Atom.to_string(provider)}}
    }
  end
end
