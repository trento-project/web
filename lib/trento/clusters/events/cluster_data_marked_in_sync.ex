# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterDataMarkedInSync do
  @moduledoc """
  This event is emitted when a cluster's data is marked as in sync after all its
  cluster host data is marked in sync.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
