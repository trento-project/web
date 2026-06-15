# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.ApplicationInstanceStatusChanged do
  @moduledoc """
  This event is emitted when a application instance status has changed.
  """

  use Trento.Support.Event

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Events.Upcaster.UpcastHelper

  defevent version: 2 do
    field :sap_system_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :status, Ecto.Enum, values: Status.values()
  end

  def upcast(params, _, 2),
    do: UpcastHelper.upcast_health_to_status(params)
end
