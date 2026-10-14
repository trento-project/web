# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ScheduledOperationJob do
  @moduledoc """
  Runs one occurrence of an operation schedule.
  """

  use Oban.Worker,
    queue: :operations,
    max_attempts: 1,
    unique: [keys: [:schedule_id, :occurrence_at], period: :infinity]

  alias Trento.Operations.Schedules

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"schedule_id" => schedule_id, "occurrence_at" => occurrence_at}}) do
    {:ok, occurrence_at, _} = DateTime.from_iso8601(occurrence_at)
    Schedules.run_occurrence(schedule_id, occurrence_at)
  end
end
