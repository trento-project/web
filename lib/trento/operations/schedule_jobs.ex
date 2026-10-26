# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.ScheduleJobs do
  @moduledoc """
  The Oban job of an operation schedule: one job per schedule, at its next
  occurrence. Jobs are inserted, replaced and cancelled in the same
  transaction as the schedule.
  """

  import Ecto.Query, only: [from: 2]

  alias Ecto.Multi
  alias Trento.Operations.OperationSchedule

  @worker "Trento.Infrastructure.Jobs.ScheduledOperationJob"

  @spec worker() :: String.t()
  def worker, do: @worker

  @spec new(OperationSchedule.t()) :: Ecto.Changeset.t()
  def new(%OperationSchedule{id: id, next_run_at: next_run_at}) do
    Oban.Job.new(
      %{schedule_id: id, run_at: next_run_at},
      worker: @worker,
      queue: :default,
      scheduled_at: next_run_at,
      max_attempts: 1
    )
  end

  @doc """
  Inserts the job of the schedule stored under `schedule_key` in the multi.
  """
  @spec insert(Multi.t(), term(), term()) :: Multi.t()
  def insert(multi, name, schedule_key),
    do: Oban.insert(multi, name, fn changes -> new(Map.fetch!(changes, schedule_key)) end)

  @doc """
  Cancels the pending jobs of a schedule.
  """
  @spec cancel(Multi.t(), term(), String.t()) :: Multi.t()
  def cancel(multi, name, schedule_id) do
    Multi.run(multi, name, fn _repo, _changes ->
      Oban.cancel_all_jobs(
        from j in Oban.Job,
          where:
            j.worker == @worker and
              fragment("?->>'schedule_id' = ?", j.args, ^schedule_id) and
              j.state in ["scheduled", "available", "retryable"]
      )
    end)
  end
end
