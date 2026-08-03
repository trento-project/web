# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Commands.UpdateDatabaseStaleAt do
  @moduledoc """
  Update the stale_at timestamp of the database associated to the SAP system.
  """

  @required_fields [:sap_system_id]

  use Trento.Support.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :database_stale_at, :utc_datetime_usec
  end
end
