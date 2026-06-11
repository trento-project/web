# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseInstanceStatusChanged do
  @moduledoc """
  This event is emitted when a database instance status has changed.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.SapSystems.Services.HealthService

  defevent version: 3 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :status, Ecto.Enum, values: Status.values()
  end

  def upcast(params, _, 3),
    do: HealthService.upcast_health_to_status(params)
end
