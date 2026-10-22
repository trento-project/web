# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Projections.AscsErsClusterHealthDetails do
  @moduledoc """
  Health details for ASCS/ERS clusters in read model format.
  """
  @required_fields [:checks_health, :sbd_health, :distributed_health]

  use Trento.Support.Type

  alias Trento.Support.HealthValueDetails

  deftype do
    embeds_one :checks_health, HealthValueDetails
    embeds_one :sbd_health, HealthValueDetails
    embeds_one :distributed_health, HealthValueDetails
  end
end
