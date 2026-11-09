# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.ClustersChecksExecutionJob do
  @moduledoc """
  Requests a checks execution for every registered cluster with selected checks.
  """

  use Trento.Infrastructure.Jobs.Worker,
    call: {Trento.Clusters, :request_clusters_checks_execution}
end
