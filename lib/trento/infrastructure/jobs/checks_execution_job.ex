# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ChecksExecutionJob do
  @moduledoc """
  Requests the checks executions that are due. Scheduled every minute.
  """

  use Oban.Worker, queue: :checks, max_attempts: 1

  @impl Oban.Worker
  def perform(%Oban.Job{}), do: Trento.ChecksScheduling.request_due_executions()
end
