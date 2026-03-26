defmodule Trento.Databases.Events.DatabaseInstanceSystemReplicationChanged do
  @moduledoc """
  This event is emitted when a database instance system replication has changed.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  defevent version: 4 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :system_replication, :string
    field :system_replication_status, :string
    field :system_replication_site, :string
    field :system_replication_site_id, :integer
    field :system_replication_mode, :string
    field :system_replication_operation_mode, :string
    field :system_replication_source_site, :string
    field :system_replication_tier, :integer
  end

  def upcast(params, _, 3),
    do: Map.put(params, "system_replication_tier", 0)

  # version 4 upcast is a fix to set tier value to nil to use it as default
  def upcast(%{"system_replication_tier" => 0} = params, _, 4),
    do: Map.put(params, "system_replication_tier", nil)

  def upcast(params, _, 4), do: params
end
