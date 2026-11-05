# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.ClusterBulkOperations do
  @moduledoc """
  Cluster operations that can be requested on multiple clusters at once
  """
  use Trento.Support.Enum, values: [:cluster_maintenance_change, :cluster_resource_refresh]
end
