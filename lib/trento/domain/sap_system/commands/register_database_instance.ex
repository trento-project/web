defmodule Trento.Domain.Commands.RegisterDatabaseInstance do
  @moduledoc """
  Register a database instance to the monitoring system.
  """

  @required_fields :all

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
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
  end
end
