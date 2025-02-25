defmodule Trento.Infrastructure.Operations.AMQP.Processor do
  @moduledoc """
  AMQP processor for the operations events
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  alias Trento.Operations.V1.{
    OperationCompleted,
    OperationStarted
  }

  require Logger

  def process(%GenRMQ.Message{payload: payload} = message) do
    Logger.debug("Received message: #{inspect(message)}")

    case Contracts.from_event(payload) do
      {:ok, event} ->
        handle(event)

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp handle(%OperationStarted{
         operation_id: operation_id,
         group_id: group_id,
         operation_type: operation_type
       }) do
    TrentoWeb.Endpoint.broadcast("monitoring:operations", "operation_started", %{
      operation_id: operation_id,
      group_id: group_id,
      operation_type: map_operation_type(operation_type)
    })
  end

  defp handle(%OperationCompleted{
         operation_id: operation_id,
         group_id: group_id,
         operation_type: operation_type,
         result: result
       }) do
    TrentoWeb.Endpoint.broadcast("monitoring:operations", "operation_completed", %{
      operation_id: operation_id,
      group_id: group_id,
      operation_type: map_operation_type(operation_type),
      result: result
    })
  end

  defp handle(event) do
    Logger.debug("Handle event: #{inspect(event)}")
  end

  defp map_operation_type("saptuneapplysolution@v1"), do: :saptune_solution_apply
  defp map_operation_type(_), do: :unknown
end
