# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Domain.Events.HostRestored do
  @moduledoc """
  This event is emitted when a host is restored from a deregistered state
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Hosts.Events.HostRestored do
    field :host_id, Ecto.UUID
  end
end
