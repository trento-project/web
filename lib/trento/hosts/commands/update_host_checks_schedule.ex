# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Commands.UpdateHostChecksSchedule do
  @moduledoc """
  Set the checks execution interval of a host (nil for the global one) and
  its exception window (nil for none).
  """

  @required_fields [:host_id]

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :interval, :string
    field :exception_window, :map
  end
end
