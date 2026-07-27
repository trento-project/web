# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterHostDataMarkedStale do
  @moduledoc """
  This event is emitted when a cluster host data is marked as stale
  because the host stopped sending fresh data.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
