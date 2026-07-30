# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Commands.MarkClusterHostStale do
  @moduledoc """
  Mark a cluster host data as stale.
  """
  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :cluster_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
