# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Events.HostRestored do
  @moduledoc """
  This event is emitted when a host is restored from a deregistered state
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
