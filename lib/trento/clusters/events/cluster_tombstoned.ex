# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Events.ClusterTombstoned do
  @moduledoc """
    This event is emitted after a successful cluster deregistration, to tombstone and stop the cluster aggregate
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
