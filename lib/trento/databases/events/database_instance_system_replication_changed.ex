defmodule Trento.Databases.Events.DatabaseInstanceSystemReplicationChanged do
  @moduledoc """
  This event is emitted when a database instance system replication has changed.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  defevent version: 3 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :system_replication, :string
    field :system_replication_status, :string
    field :system_replication_site, :string
    field :system_replication_mode, :string
    field :system_replication_operation_mode, :string
    field :system_replication_source_site, :string
    field :system_replication_tier, :integer
  end

  def upcast(params, _, 3),
    do: Map.put(params, "system_replication_tier", 0)
end
