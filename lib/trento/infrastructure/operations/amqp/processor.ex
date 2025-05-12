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

  alias Trento.Infrastructure.Operations

  alias Trento.ActivityLog.ActivityLogger

  alias Trento.Discovery

  require Logger

  def process(%GenRMQ.Message{payload: payload} = message) do
    Logger.debug("Received message: #{inspect(message)}")

    case Contracts.from_event(payload) do
      {:ok, event} ->
        event
        |> log_activity()
        |> handle()

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp log_activity(event) do
    ActivityLogger.log_activity(%{queue_event: event})

    event
  end

  defp handle(%OperationStarted{
         operation_id: operation_id,
         group_id: group_id,
         operation_type: operation_type
       }) do
    TrentoWeb.Endpoint.broadcast("monitoring:operations", "operation_started", %{
      operation_id: operation_id,
      group_id: group_id,
      operation_type: Operations.map_operation_type(operation_type)
    })
  end

  defp handle(%OperationCompleted{
         operation_id: operation_id,
         group_id: group_id,
         operation_type: operation_type,
         result: result
       }) do
    mapped_operation_type = Operations.map_operation_type(operation_type)

    TrentoWeb.Endpoint.broadcast("monitoring:operations", "operation_completed", %{
      operation_id: operation_id,
      group_id: group_id,
      operation_type: mapped_operation_type,
      result: result
    })

    maybe_request_discovery(mapped_operation_type, result, group_id)
  end

  defp handle(event) do
    Logger.debug("Unknown event: #{inspect(event)}")
  end

  defp maybe_request_discovery(operation, :UPDATED, group_id)
       when operation in [:saptune_solution_apply, :saptune_solution_change] do
    Discovery.request_saptune_discovery(group_id)
  end

  defp maybe_request_discovery(_, _, _), do: :ok
end
