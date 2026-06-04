# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterDistributedHealthChanged do
  @moduledoc """
  This event is emitted when the distribution of ASCS/ERS nodes in a cluster changes.
  Only applicable for ASCS/ERS clusters.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :distributed_health, Ecto.Enum, values: Health.values()
  end
end
