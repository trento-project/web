# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Clusters.Commands.UpdateClusterChecksSchedule do
  @moduledoc """
  Set the checks execution interval of a cluster (nil for the global one) and
  its exception window (nil for none).
  """

  @required_fields [:cluster_id]

  use Trento.Support.Command

  defcommand do
    field :cluster_id, Ecto.UUID
    field :interval, :string
    field :exception_window, :map
  end
end
