# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterHostDataMarkedInSync do
  @moduledoc """
  This event is emitted when a cluster host data is marked as in sync
  because the stale host sent fresh data again.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
  end
end
