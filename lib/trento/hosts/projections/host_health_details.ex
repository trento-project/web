# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Projections.HostHealthDetails do
  @moduledoc """
  Health details for Hosts in read model format.
  """
  @required_fields [:checks_health, :saptune_health, :software_updates_discovery_health]

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :checks_health, HealthValueDetails, on_replace: :update
    embeds_one :saptune_health, HealthValueDetails, on_replace: :update
    embeds_one :software_updates_discovery_health, HealthValueDetails, on_replace: :update
  end
end
