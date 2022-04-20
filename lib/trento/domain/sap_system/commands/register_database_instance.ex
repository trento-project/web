defmodule Trento.Domain.Commands.RegisterDatabaseInstance do
  @moduledoc """
  Register a database instance to the monitoring system.
  """

  @required_fields [
    :sap_system_id,
    :sid,
    :tenant,
    :host_id,
    :instance_number,
    :features,
    :http_port,
    :https_port,
    :health
  ]

  use Trento.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :tenant, :string
    field :host_id, :string
    field :instance_number, :string
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :system_replication, :string
    field :system_replication_status, :string
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
  end
end
