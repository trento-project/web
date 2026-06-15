# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseInstanceRegistered do
  @moduledoc """
  This event is emitted when a database instance is registered.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Events.Upcaster.UpcastHelper

  defevent version: 5 do
    field :database_id, Ecto.UUID
    field :sid, :string
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :system_replication, :string
    field :system_replication_status, :string
    field :system_replication_site, :string
    field :system_replication_site_id, :integer
    field :system_replication_mode, :string
    field :system_replication_operation_mode, :string
    field :system_replication_source_site, :string
    field :system_replication_tier, :integer
    field :status, Ecto.Enum, values: Status.values()
  end

  def upcast(params, _, 3),
    do: Map.put(params, "system_replication_tier", 0)

  # version 4 upcast is a fix to set tier value to nil to use it as default
  def upcast(%{"system_replication_tier" => 0} = params, _, 4),
    do: Map.put(params, "system_replication_tier", nil)

  def upcast(params, _, 4), do: params

  def upcast(params, _, 5),
    do: UpcastHelper.upcast_health_to_status(params)
end
