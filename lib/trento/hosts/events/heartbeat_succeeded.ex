# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Events.HeartbeatSucceeded do
  @moduledoc """
  Heartbeat succeeded event
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
