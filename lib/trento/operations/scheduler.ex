# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Scheduler do
  @moduledoc """
  Starts the runs of the due operation schedules. A Quantum job calls
  `run_due/1` every minute.

  The aggregate accepts the start of a run only for its next occurrence and
  only once, so a schedule whose run is in progress is safely skipped. The
  run itself happens in
  `Trento.Infrastructure.Commanded.EventHandlers.ScheduledRunsEventHandler`.
  """

  import Ecto.Query, only: [from: 2]

  alias Trento.Operations.Commands.StartScheduledRun
  alias Trento.Operations.OperationSchedule
  alias Trento.Repo
  alias Trento.Support.{CommandedUtils, DateService}

  @spec run_due(module()) :: :ok
  def run_due(date_service \\ DateService) do
    now = date_service.utc_now()

    from(s in OperationSchedule,
      where: s.next_run_at <= ^now,
      order_by: [asc: s.next_run_at],
      select: {s.id, s.next_run_at}
    )
    |> Repo.all()
    |> Enum.each(fn {schedule_id, run_at} ->
      %{schedule_id: schedule_id, run_at: run_at, started_at: now}
      |> StartScheduledRun.new!()
      |> CommandedUtils.dispatch(correlation_id: schedule_id, causation_id: schedule_id)
    end)
  end
end
