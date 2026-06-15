# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.ApplicationInstanceRegistered do
  @moduledoc """
  This event is emitted when a database application is registered to the SAP system.
  """

  use Trento.Support.Event

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Events.Upcaster.UpcastHelper

  defevent version: 2 do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :status, Ecto.Enum, values: Status.values()
  end

  def upcast(params, _, 2),
    do: UpcastHelper.upcast_health_to_status(params)
end
