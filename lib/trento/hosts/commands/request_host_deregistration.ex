# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.Commands.RequestHostDeregistration do
  @moduledoc """
    Request a deregistration of a host
  """
  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :requested_at, :utc_datetime_usec
  end
end
