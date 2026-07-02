# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Hosts.ValueObjects.HealthDetails do
  @moduledoc """
  Host health details struct.

  Additional information about the fields available in the host
  aggregate docstring.
  """

  @required_fields nil

  use Trento.Support.Type

  require Trento.Enums.Health, as: Health
  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  deftype do
    field :checks_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :saptune_health, Ecto.Enum, values: Health.values(), default: Health.unknown()

    field :software_updates_discovery_health, Ecto.Enum,
      values: SoftwareUpdatesHealth.values(),
      default: SoftwareUpdatesHealth.not_set()
  end
end
