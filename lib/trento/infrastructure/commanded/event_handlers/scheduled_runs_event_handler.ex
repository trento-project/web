# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Commanded.EventHandlers.ScheduledRunsEventHandler do
  @moduledoc """
  Runs a started occurrence of an operation schedule: the side effect the
  aggregate cannot do.

  Later than the grace period, the request failed because Trento was not
  available. Otherwise the operation policies run on fresh data and the
  operation is requested when they pass. The outcome goes back to the
  aggregate with CompleteScheduledRun.

  A request that cannot be sent is retried every minute until the grace
  period ends, then recorded as not available.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "scheduled_runs_event_handler",
    start_from: :current

  alias Commanded.Event.FailureContext
  alias Trento.Operations.Commands.CompleteScheduledRun
  alias Trento.Operations.Events.ScheduledRunStarted
  alias Trento.Operations.{OperationSchedule, Requests}
  alias Trento.Repo
  alias Trento.Support.{CommandedUtils, DateService}

  require Logger

  @grace_period_seconds 300
  @retry_delay :timer.minutes(1)

  def handle(%ScheduledRunStarted{schedule_id: schedule_id, run_at: run_at}, metadata) do
    date_service = date_service(metadata)

    case Repo.get(OperationSchedule, schedule_id) do
      nil -> :ok
      schedule -> run(schedule, run_at, date_service.utc_now())
    end
  end

  def error({:error, reason}, %ScheduledRunStarted{} = event, %FailureContext{} = failure) do
    now = date_service(failure.metadata).utc_now()

    if late?(event.run_at, now) do
      Logger.warning("Scheduled run of #{event.schedule_id} not requested: #{inspect(reason)}")
      complete(event.schedule_id, event.run_at, now, :failed, %{reason: "not_available"})
      :skip
    else
      {:retry, @retry_delay, failure.context}
    end
  end

  defp run(%OperationSchedule{id: schedule_id} = schedule, run_at, now) do
    if late?(run_at, now) do
      complete(schedule_id, run_at, now, :failed, %{reason: "not_available"})
    else
      {:ok, target_type, operation} = Requests.parse(schedule.target_type, schedule.operation)

      case Requests.request(target_type, schedule.target_id, operation, schedule.params) do
        {:ok, operation_id} ->
          complete(schedule_id, run_at, now, :requested, %{operation_id: operation_id})

        {:error, :forbidden, errors} ->
          complete(schedule_id, run_at, now, :failed, %{reason: "policies", errors: errors})

        {:error, :not_found} ->
          complete(schedule_id, run_at, now, :failed, %{reason: "target_not_found"})

        {:error, _} = error ->
          error
      end
    end
  end

  defp complete(schedule_id, run_at, now, outcome, extra) do
    %{schedule_id: schedule_id, run_at: run_at, outcome: outcome, completed_at: now}
    |> Map.merge(extra)
    |> CompleteScheduledRun.new!()
    |> CommandedUtils.dispatch(correlation_id: schedule_id, causation_id: schedule_id)
  end

  defp late?(run_at, now), do: DateTime.diff(now, run_at) > @grace_period_seconds

  # Tests set the date service in the metadata
  defp date_service(metadata), do: Map.get(metadata || %{}, :date_service, DateService)
end
