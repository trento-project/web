# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.HostsChecksExecutionJob do
  @moduledoc """
  Requests a checks execution for every registered host with selected checks.
  """

  use Trento.Infrastructure.Jobs.Worker, call: {Trento.Hosts, :request_hosts_checks_execution}
end
