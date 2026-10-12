# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Domain.Events.HostChecksSelected do
  @moduledoc """
  Event of the checks selected for a host.
  """

  use Trento.Support.Event

  defevent superseded_by: Trento.Hosts.Events.HostChecksSelected do
    field :host_id, Ecto.UUID
    field :checks, {:array, :string}
  end
end
