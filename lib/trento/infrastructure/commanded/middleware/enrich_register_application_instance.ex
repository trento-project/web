defimpl Trento.Infrastructure.Commanded.Middleware.Enrichable,
  for: Trento.SapSystems.Commands.RegisterApplicationInstance do
  alias Trento.SapSystems.Commands.RegisterApplicationInstance

  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Databases.Projections.DatabaseInstanceReadModel

  alias Trento.Repo
  import Ecto.Query

  @spec enrich(RegisterApplicationInstance.t(), map) :: {:ok, map} | {:error, any}
  def enrich(%RegisterApplicationInstance{db_host: db_host, tenant: tenant} = command, _) do
    query =
      from d in DatabaseInstanceReadModel,
        join: h in HostReadModel,
        on: d.host_id == h.id,
        where: ^db_host in h.ip_addresses and ^tenant == d.tenant and is_nil(h.deregistered_at)

    case Repo.one(query) do
      %DatabaseInstanceReadModel{database_id: database_id} ->
        {:ok,
         %RegisterApplicationInstance{
           command
           | sap_system_id: UUID.uuid5(database_id, tenant),
             database_id: database_id
         }}

      nil ->
        {:error, :database_not_registered}
    end
  end
end
