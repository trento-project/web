# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Projections.HostHealthDetails do
  @moduledoc """
  Health details for Hosts in read model format.
  """
  @required_fields []

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :checks_health, HealthValueDetails, on_replace: :update, defaults_to_struct: true
    embeds_one :saptune_health, HealthValueDetails, on_replace: :update, defaults_to_struct: true

    embeds_one :software_updates_discovery_health, HealthValueDetails,
      on_replace: :update,
      defaults_to_struct: true
  end
end
