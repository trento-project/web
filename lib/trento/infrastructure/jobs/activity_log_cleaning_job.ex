# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ActivityLogCleaningJob do
  @moduledoc """
  Deletes the activity log entries older than the retention time.
  """

  use Oban.Worker, max_attempts: 1

  @impl Oban.Worker
  def perform(%Oban.Job{}), do: Trento.ActivityLog.clear_expired_logs()
end
