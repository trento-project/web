defmodule Trento.Integration.Checks do
  @moduledoc """
  Checks runner service integration
  """

  alias Trento.Infrastructure.Messaging

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  require Logger

  @spec request_execution(String.t(), String.t(), map, [map], [String.t()]) ::
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

  defp build_env(env) do
    Enum.into(env, %{}, fn {k, v} -> {k, %{kind: build_env_entry(v)}} end)
  end

  # :struct_value and :list_value are missing
  defp build_env_entry(value) when is_binary(value), do: {:string_value, value}
  defp build_env_entry(value) when is_boolean(value), do: {:bool_value, value}
  defp build_env_entry(value) when is_number(value), do: {:number_value, value}
  defp build_env_entry(value) when is_nil(value), do: {:null_value, value}
  defp build_env_entry(value) when is_atom(value), do: {:string_value, Atom.to_string(value)}
end
