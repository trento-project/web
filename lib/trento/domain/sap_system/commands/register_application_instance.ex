defmodule Trento.Domain.Commands.RegisterApplicationInstance do
  @moduledoc """
  Register an application instance to the monitoring system.
  """

  @required_fields [
    :host_id,
    :instance_number,
    :health,
    :sid,
    :db_host,
    :tenant,
    :host_id,
    :instance_number,
    :instance_hostname,
    :features,
    :http_port,
    :https_port,
    :start_priority,
    :health
  ]

  use Trento.Command

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :db_host, :string
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
