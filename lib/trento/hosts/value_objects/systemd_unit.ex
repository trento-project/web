# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Hosts.ValueObjects.SystemdUnit do
  @moduledoc """
  Systemd unit value object
  """
  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :name, :string
    field :unit_file_state, :string
  end
end
