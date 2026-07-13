# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.SapSystemDataMarkedInSync do
  @moduledoc """
  This event is emitted when a SAP system data is marked as in sync.
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
  end
end
