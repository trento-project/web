# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ChecksExecutionJob do
  @moduledoc """
  Requests the due checks executions of the hosts and clusters, see `Trento.Checks`.
  """

  use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.Checks.request_due_executions()

    :ok
  end
end
