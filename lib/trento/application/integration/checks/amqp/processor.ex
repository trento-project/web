defmodule Trento.Integration.Checks.AMQP.Processor do
  @moduledoc """
  AMQP processor for the checks execution events
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  alias Trento.Checks.V1.{
    ExecutionCompleted,
    ExecutionStarted
  }

  alias Trento.Domain.Commands.CompleteChecksExecution

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
    Logger.debug("Targets for execution #{inspect(targets)}")

    TrentoWeb.Endpoint.broadcast("monitoring:executions", "execution_started", %{
      group_id: group_id,
      execution_id: execution_id,
      targets: map_targets(targets)
    })
  end

  defp handle(%ExecutionCompleted{
         execution_id: execution_id,
         group_id: group_id,
         result: result
       }) do
    with :ok <-
           commanded().dispatch(
             CompleteChecksExecution.new!(%{
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

  defp map_targets(targets), do: Enum.map(targets, &%{checks: &1.checks, agent_id: &1.agent_id})

  defp map_health(:CRITICAL), do: Health.critical()
  defp map_health(:WARNING), do: Health.warning()
  defp map_health(:PASSING), do: Health.passing()

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
