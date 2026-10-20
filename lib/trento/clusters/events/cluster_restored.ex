# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Events.ClusterRestored do
  @moduledoc """
  This event is emitted after a cluster is restored from a deregistered state
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
  end
end
