defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor do
  @moduledoc """
  AMQP processor.
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  alias Trento.Checks.V1.{
    ExecutionCompleted,
    ExecutionStarted
  }

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

  defp handle(%ExecutionStarted{
         execution_id: execution_id,
         group_id: group_id,
         targets: targets
       }) do
    checks_for_execution =
      targets
      |> Enum.flat_map(& &1.checks)
      |> Enum.uniq()

    Logger.debug("Checks for execution #{inspect(checks_for_execution)}")

    TrentoWeb.Endpoint.broadcast("monitoring:executions", "execution_started", %{
      group_id: group_id,
      execution_id: execution_id,
      checks: checks_for_execution
    })
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
