# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterDiscoveredHealthChanged do
  @moduledoc """
  This event is emitted when the discovered health of a cluster changes.

  This event is deprecated in favor of specific health change events.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :discovered_health, Ecto.Enum, values: Health.values()
  end
end
