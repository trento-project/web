# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.SapSystemDataMarkedStale do
  @moduledoc """
  This event is emitted when a SAP system data is marked as stale.
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :stale_at, :utc_datetime_usec
  end
end
