# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Enums.SbdDeviceStatus do
  @moduledoc """
  Type that represents the SBD device status.
  """

  use Trento.Support.Enum,
    values: [
      :healthy,
      :unhealthy
    ]
end
