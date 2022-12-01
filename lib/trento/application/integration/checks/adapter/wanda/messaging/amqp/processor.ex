defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor do
  @moduledoc """
  AMQP processor.
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Domain.Commands.CompleteChecksExecutionWanda

  require Logger
  require Trento.Domain.Enums.Health, as: Health

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
    with :ok <-
           commanded().dispatch(
             CompleteChecksExecutionWanda.new!(%{
               cluster_id: group_id,
               health: map_health(result)
             }),
             correlation_id: execution_id
           ) do
      TrentoWeb.Endpoint.broadcast("monitoring:executions", "execution_completed", %{
        group_id: group_id
      })
    end
  end

  defp map_health(:CRITICAL), do: Health.critical()
  defp map_health(:WARNING), do: Health.warning()
  defp map_health(:PASSING), do: Health.passing()

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
