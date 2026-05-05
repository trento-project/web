# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Hosts.Commands.RollUpHost do
  @moduledoc """
  Start a host aggregate rollup
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
  end
end
