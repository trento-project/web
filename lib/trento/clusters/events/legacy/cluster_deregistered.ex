# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Domain.Events.ClusterDeregistered do
  @moduledoc """
  This event is emitted when a cluster is deregistered.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Clusters.Events.ClusterDeregistered do
    field :cluster_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
