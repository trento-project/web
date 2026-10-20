# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.ClusterOperations do
  @moduledoc """
  Cluster operations
  """
  use Trento.Support.Enum, values: [:cluster_maintenance_change, :cluster_resource_refresh]
end
