# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.HostsChecksExecutionJob do
  @moduledoc """
  Requests the due checks executions of the hosts, see `Trento.Checks`.
  """

  use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.Checks.request_due_executions(:host)

    :ok
  end
end
