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

  alias Trento.Support.Protobuf

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
          %OperationTarget{agent_id: agent_id, arguments: Protobuf.from_map(arguments)}
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

  def map_operation_type("saptuneapplysolution@v1"), do: :saptune_solution_apply

  def map_operation_type("saptunechangesolution@v1"), do: :saptune_solution_change

  def map_operation_type(_), do: :unknown
end
