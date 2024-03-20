defmodule Trento.Databases.Commands.RegisterDatabaseInstance do
  @moduledoc """
  Register a database instance to the monitoring system.
  """

  @required_fields [
    :database_id,
    :sid,
    :tenant,
    :host_id,
    :instance_number,
    :features,
    :http_port,
    :https_port,
    :health
  ]

  use Trento.Support.Command

  require Trento.Enums.Health, as: Health

  defcommand do
    field :database_id, Ecto.UUID
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
