# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Enums.ClusterEnsaVersion do
  @moduledoc """
  Type that represents the ENSA version info for a cluster.
  """

  use Trento.Support.Enum, values: [:mixed_versions, :ensa1, :ensa2, :unknown]
end
