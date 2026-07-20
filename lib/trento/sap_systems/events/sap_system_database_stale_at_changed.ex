# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.SapSystemDatabaseStaleAtChanged do
  @moduledoc """
  This event is emitted when the database stale state associated to a SAP System changes.
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :database_stale_at, :utc_datetime_usec
  end
end
