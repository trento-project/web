# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Events.HostChecksScheduleUpdated do
  @moduledoc """
  The checks execution interval and the exception window of a host changed.
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    field :interval, :string
    field :exception_window, :map
  end
end
