# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.ClusterHostOperations do
  @moduledoc """
  Cluster host operations
  """
  use Trento.Support.Enum,
    values: [:pacemaker_enable, :pacemaker_disable, :cluster_host_start, :cluster_host_stop]
end
