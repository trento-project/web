# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterDataMarkedStale do
  @moduledoc """
  This event is emitted when a cluster's data is marked as stale after at least
  one cluster host data is marked stale.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
