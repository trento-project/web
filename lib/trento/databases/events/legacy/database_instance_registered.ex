defmodule Trento.SapSystems.Events.DatabaseInstanceRegistered do
  @moduledoc """
  This event is emitted when a database instance is registered to the SAP system.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent superseded_by: Trento.Databases.Events.DatabaseInstanceRegistered do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :tenant, :string
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
  end
end
