# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.ApplicationInstanceDataMarkedStale do
  @moduledoc """
  This event is emitted when an application instance data is marked as stale.
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :instance_number, :string
    field :host_id, Ecto.UUID
  end
end
