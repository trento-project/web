# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterReplicationHealthChanged do
  @moduledoc """
  This event is emitted when the replication health of a cluster changes.
  Only applicable for HANA clusters.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :replication_health, Ecto.Enum, values: Health.values()
  end
end
