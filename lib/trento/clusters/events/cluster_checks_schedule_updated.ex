# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Events.ClusterChecksScheduleUpdated do
  @moduledoc """
  The checks execution interval and the exception window of a cluster changed.
  """

  use Trento.Support.Event

  defevent do
    field :cluster_id, Ecto.UUID
    field :interval, :string
    field :exception_window, :map
  end
end
