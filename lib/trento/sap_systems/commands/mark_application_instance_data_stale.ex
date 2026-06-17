# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Commands.MarkApplicationInstanceDataStale do
  @moduledoc """
  Mark an application instance data as stale.
  """
  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :instance_number, :string
    field :host_id, Ecto.UUID
  end
end
