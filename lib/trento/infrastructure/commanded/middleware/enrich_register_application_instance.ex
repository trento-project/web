defimpl Trento.Infrastructure.Commanded.Middleware.Enrichable,
  for: Trento.SapSystems.Commands.RegisterApplicationInstance do
  alias Trento.SapSystems.Commands.RegisterApplicationInstance

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Databases.Projections.{
    DatabaseReadModel,
    DatabaseInstanceReadModel
  }

  alias Trento.Repo
  import Ecto.Query

  @spec enrich(RegisterApplicationInstance.t(), map) :: {:ok, map} | {:error, any}
  def enrich(%RegisterApplicationInstance{db_host: db_host, tenant: tenant} = command, _) do
    query =
      from d in DatabaseReadModel,
        join: di in DatabaseInstanceReadModel,
        on: d.id == di.database_id,
        join: h in HostReadModel,
        on: di.host_id == h.id,
        where:
          ^db_host in h.ip_addresses and
            fragment("? @\\? '$.name \\? (@ == ?)'", d.tenants, literal(^tenant)) and
            is_nil(h.deregistered_at) and is_nil(d.deregistered_at)

    case Repo.one(query) do
      %DatabaseReadModel{id: database_id, health: database_health} ->
        {:ok,
         %RegisterApplicationInstance{
           command
           | sap_system_id: UUID.uuid5(database_id, tenant),
             database_id: database_id,
             database_health: database_health
         }}

      nil ->
        {:ignore, :database_not_registered}
    end
  end
end
