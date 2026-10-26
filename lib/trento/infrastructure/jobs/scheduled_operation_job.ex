# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ScheduledOperationJob do
  @moduledoc """
  Runs one occurrence of an operation schedule, see `Trento.Operations.Scheduler`.
  """

  use Oban.Worker, queue: :default, max_attempts: 1

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"schedule_id" => schedule_id, "run_at" => run_at}}) do
    {:ok, run_at, _} = DateTime.from_iso8601(run_at)
    Trento.Operations.Scheduler.run(schedule_id, run_at)
  end
end
