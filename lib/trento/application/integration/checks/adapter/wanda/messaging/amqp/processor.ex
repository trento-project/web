defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor do
  @moduledoc """
  AMQP processor.
  """

  @behaviour GenRMQ.Processor

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Contracts
  alias Trento.Domain.Commands.CompleteChecksExecutionWanda

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

  defp handle(%ExecutionCompleted{
         execution_id: execution_id,
         group_id: group_id,
         result: result
       }) do
    with {:ok, command} <-
           CompleteChecksExecutionWanda.new(%{
             cluster_id: group_id,
             health: map_health(result)
           }) do
      Trento.Commanded.dispatch(command, correlation_id: execution_id)
    end
  end

  defp map_health(:CRITICAL), do: :critical
  defp map_health(:WARNING), do: :warning
  defp map_health(:PASSING), do: :passing
end
