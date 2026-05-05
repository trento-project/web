# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Hosts.Commands.UpdateHeartbeat do
  @moduledoc """
  Updated the host heartbeat.
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :heartbeat, Ecto.Enum, values: [:passing, :critical]
  end
end
