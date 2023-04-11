defmodule Trento.Domain.Commands.RegisterApplicationInstance do
  @moduledoc """
  Register an application instance to the monitoring system.

  In order to register an application instance a database entry associated to this application
  must be already registered.

  The database/application association consists of having:
  - the application instance `tenant` field matching with an already registered database instance `tenant`
  - the application `db_host` field matching with one of the IP addresses of the host where this database is running

  Find the association protocol code [here](https://github.com/trento-project/web/blob/main/lib/trento/application/integration/discovery/protocol/enrich_register_application_instance.ex)
  as reference.
  """

  @required_fields [
    :host_id,
    :instance_number,
    :sid,
    :db_host,
    :tenant,
    :instance_hostname,
    :features,
    :http_port,
    :https_port,
    :start_priority,
    :health
  ]

  use Trento.Command

  require Trento.Domain.Enums.Health, as: Health

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :db_host, :string
    field :tenant, :string
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
