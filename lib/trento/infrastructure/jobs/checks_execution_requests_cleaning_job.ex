# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ChecksExecutionRequestsCleaningJob do
  @moduledoc """
  Deletes the checks execution requests of the deregistered and removed hosts and clusters.
  """

  use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.Checks.delete_stale_execution_requests()

    :ok
  end
end
