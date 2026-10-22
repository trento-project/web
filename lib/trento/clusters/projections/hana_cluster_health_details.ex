# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Projections.HanaClusterHealthDetails do
  @moduledoc """
  Health details for HANA clusters in read model format.
  """
  @required_fields [:checks_health, :sbd_health, :replication_health]

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :checks_health, HealthValueDetails
    embeds_one :sbd_health, HealthValueDetails
    embeds_one :replication_health, HealthValueDetails
  end
end
