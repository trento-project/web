# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ChecksExecutionJob do
  @moduledoc """
  Requests a checks execution for every host and cluster.
  """

  use Oban.Worker, queue: :checks, max_attempts: 1

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.Hosts.request_hosts_checks_execution()
    Trento.Clusters.request_clusters_checks_execution()

    :ok
  end
end
