# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Hosts.Events.HeartbeatSucceeded do
  @moduledoc """
  Heartbeat succeeded event
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
  end
end
