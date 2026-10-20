# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Enums.HanaArchitectureType do
  @moduledoc """
  Type that represents the supported HANA architecture types.
  """

  use Trento.Support.Enum, values: [:classic, :angi]
end
