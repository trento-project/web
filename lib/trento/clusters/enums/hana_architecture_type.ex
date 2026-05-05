# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Enums.HanaArchitectureType do
  @moduledoc """
  Type that represents the supported HANA architecture types.
  """

  use Trento.Support.Enum, values: [:classic, :angi]
end
