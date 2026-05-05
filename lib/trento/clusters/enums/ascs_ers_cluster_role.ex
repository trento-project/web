# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Enums.AscsErsClusterRole do
  @moduledoc """
  Type that represents the ASCS/ERS cluster roles.
  """

  use Trento.Support.Enum, values: [:ascs, :ers]
end
