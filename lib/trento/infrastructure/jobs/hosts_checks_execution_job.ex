# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.HostsChecksExecutionJob do
  @moduledoc """
  Requests a checks execution for every registered host with selected checks.
  """

  use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.Hosts.request_hosts_checks_execution()

    :ok
  end
end
