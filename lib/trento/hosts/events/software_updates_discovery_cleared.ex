# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Events.SoftwareUpdatesDiscoveryCleared do
  @moduledoc """
  This event is emitted when a host's software updates discovery is cleared
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
