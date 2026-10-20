# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Domain.Events.ChecksSelected do
  @moduledoc """
  Event of the checks selected in a cluster.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Clusters.Events.ChecksSelected do
    field :cluster_id, Ecto.UUID
    field :checks, {:array, :string}
  end
end
