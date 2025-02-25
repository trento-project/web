defmodule Trento.Infrastructure.Operations do
  @moduledoc """
  Operations integration
  """

  alias Trento.Operations.V1.{
    OperationRequested,
    OperationTarget
  }

  alias Trento.Infrastructure.Messaging

  alias Trento.Infrastructure.Operations.AMQP.Publisher

  require Logger

  @type operation_target :: %{
          agent_id: String.t(),
          arguments: map()
        }

  @spec request_operation(String.t(), String.t(), String.t(), [operation_target()]) ::
          :ok | {:error, any}
  def request_operation(operation_id, group_id, operation, targets) do
    operation_requested = %OperationRequested{
      operation_id: operation_id,
      group_id: group_id,
      operation_type: operation,
      targets:
        Enum.map(targets, fn %{agent_id: agent_id, arguments: arguments} ->
          %OperationTarget{agent_id: agent_id, arguments: map_value(arguments)}
        end)
    }

    case Messaging.publish(Publisher, "requests", operation_requested) do
      :ok ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to publish message to topic operations: #{inspect(reason)}")

        error
    end
  end

  defp map_value(map) when is_map(map) do
    Enum.into(map, %{}, fn {key, value} -> {map_key(key), map_value(value)} end)
  end

  defp map_value(value) when is_number(value), do: %{kind: {:number_value, value}}
  defp map_value(value) when is_boolean(value), do: %{kind: {:bool_value, value}}
  defp map_value(value) when is_nil(value), do: %{kind: {:null_value}}
  defp map_value(value) when is_atom(value), do: %{kind: {:string_value, Atom.to_string(value)}}
  defp map_value(value), do: %{kind: {:string_value, value}}

  defp map_key(key) when is_atom(key), do: Atom.to_string(key)
  defp map_key(key), do: key
end
