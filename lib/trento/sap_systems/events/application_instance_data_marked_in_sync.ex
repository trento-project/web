# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Events.ApplicationInstanceDataMarkedInSync do
  @moduledoc """
  This event is emitted when an application instance data is marked as
  synchronized and valid.
  """

  use Trento.Support.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :instance_number, :string
    field :host_id, Ecto.UUID
  end
end
