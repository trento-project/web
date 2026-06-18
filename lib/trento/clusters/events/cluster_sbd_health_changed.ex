# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterSbdHealthChanged do
  @moduledoc """
  This event is emitted when the health of the SBD fencing in a cluster changes.

  Applies to all kinds of clusters but it's optional.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent do
    field :cluster_id, Ecto.UUID
    field :sbd_health, Ecto.Enum, values: Health.values()
  end
end
