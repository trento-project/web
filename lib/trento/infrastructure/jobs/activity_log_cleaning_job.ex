# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ActivityLogCleaningJob do
  @moduledoc """
  Deletes the activity log entries older than the retention time.
  """

  use Trento.Infrastructure.Jobs.Worker, call: {Trento.ActivityLog, :clear_expired_logs}
end
