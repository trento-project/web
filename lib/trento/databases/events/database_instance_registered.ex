defmodule Trento.Databases.Events.DatabaseInstanceRegistered do
  @moduledoc """
  This event is emitted when a database instance is registered.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  require Trento.Enums.Health, as: Health

  alias Trento.Databases.ValueObjects.Tenant

  defevent version: 2 do
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
    field :health, Ecto.Enum, values: Health.values()

    embeds_many :tenants, Tenant
  end

  def upcast(%{tenant: tenant} = params, _, 2),
    do: Map.put(params, "tenants", [Tenant.new!(%{name: tenant})])
end
