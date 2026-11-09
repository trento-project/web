# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ClustersChecksExecutionJob do
  @moduledoc """
  Requests a checks execution for every registered cluster with selected checks.
  """

  use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.Clusters.request_clusters_checks_execution()

    :ok
  end
end
