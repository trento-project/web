defmodule Trento.SapSystems.Commands.RegisterApplicationInstance do
  @moduledoc """
  Register an application instance to the monitoring system.

  In order to register an application instance a database entry associated to this application
  must be already registered.

  The database/application association consists of having:
  - the application instance `tenant` field matching with an already registered database instance `tenant`
  - the application `db_host` field matching with one of the IP addresses of the host where this database is running

  Find the association protocol code [here](https://github.com/trento-project/web/blob/main/lib/trento/application/integration/discovery/protocol/enrich_register_application_instance.ex)
  as reference.

  cluster_id value is used to know if the application instance is clustered or not.
  This information is required in order to decide whether the instance was moved by the cluster in a failover scenario or not
  """

  @required_fields [
    :host_id,
    :instance_number,
    :sid,
    :db_host,
    :instance_hostname,
    :features,
    :http_port,
    :https_port,
    :start_priority,
    :health
  ]

  use Trento.Support.Command

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Enums.Health, as: Health

  defcommand do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :db_host, :string
    field :tenant, :string
    field :host_id, Ecto.UUID
    field :clustered, :boolean
    field :instance_number, :string
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :database_id, Ecto.UUID
    field :start_priority, :string
    field :health, Ecto.Enum, values: Health.values()
    field :database_health, Ecto.Enum, values: Health.values()
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values()
  end
end
