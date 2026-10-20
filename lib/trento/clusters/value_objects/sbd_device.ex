# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.ValueObjects.SbdDevice do
  @moduledoc """
  Represents the SBDDevice of a HANA cluster.
  """

  @required_fields :all

  use Trento.Support.Type

  require Trento.Clusters.Enums.SbdDeviceStatus, as: SbdDeviceStatus

  deftype do
    field :device, :string
    field :status, Ecto.Enum, values: SbdDeviceStatus.values()
  end
end
