defmodule Trento.Databases.Events.DatabaseInstanceRegistered do
  @moduledoc """
  This event is emitted when a database instance is registered.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  require Trento.Enums.Health, as: Health

  defevent version: 3 do
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
    field :system_replication_mode, :string
    field :system_replication_operation_mode, :string
    field :system_replication_source_site, :string
    field :system_replication_tier, :integer
    field :health, Ecto.Enum, values: Health.values()
  end

  def upcast(params, _, 3),
    do: Map.put(params, "system_replication_tier", 0)
end
