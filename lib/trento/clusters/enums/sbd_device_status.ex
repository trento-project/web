# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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
