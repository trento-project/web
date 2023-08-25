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

  alias Trento.Integration.Checks
  alias Trento.Integration.Checks.TargetType

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
         targets: targets,
         target_type: target_type
       }) do
    Logger.debug("Targets for execution #{inspect(targets)}")

    TrentoWeb.Endpoint.broadcast("monitoring:executions", "execution_started", %{
      group_id: group_id,
      execution_id: execution_id,
      targets: map_targets(targets),
      target_type: target_type
    })
  end

  defp handle(%ExecutionCompleted{
         execution_id: execution_id,
         group_id: group_id,
         result: result,
         target_type: target_type
       }) do
    with :ok <-
           Checks.complete_execution(
             execution_id,
             group_id,
             map_health(result),
             TargetType.from_string(target_type)
           ) do
      TrentoWeb.Endpoint.broadcast("monitoring:executions", "execution_completed", %{
        group_id: group_id,
        target_type: target_type
      })
    end
  end

  defp map_targets(targets), do: Enum.map(targets, &%{checks: &1.checks, agent_id: &1.agent_id})

  defp map_health(:CRITICAL), do: Health.critical()
  defp map_health(:WARNING), do: Health.warning()
  defp map_health(:PASSING), do: Health.passing()
end
