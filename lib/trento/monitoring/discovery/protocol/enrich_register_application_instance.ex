defimpl Trento.Support.Middleware.Enrichable,
  for: Trento.Monitoring.Domain.Commands.RegisterApplicationInstance do
  alias Trento.Monitoring.Domain.Commands.RegisterApplicationInstance

  alias Trento.Monitoring.DatabaseInstanceReadModel
  alias Trento.Monitoring.HostReadModel

  alias Trento.Repo
  import Ecto.Query

  @spec enrich(RegisterApplicationInstance.t(), map) :: {:ok, map} | {:error, any}
  def enrich(%RegisterApplicationInstance{db_host: db_host, tenant: tenant} = command, _) do
    query =
      from d in DatabaseInstanceReadModel,
        join: h in HostReadModel,
        on: d.host_id == h.id,
        where: ^db_host in h.ip_addresses and ^tenant == d.tenant

    case Repo.one(query) do
      %DatabaseInstanceReadModel{sap_system_id: sap_system_id} ->
        {:ok, %RegisterApplicationInstance{command | sap_system_id: sap_system_id}}

      nil ->
        {:error, :database_not_found}
    end
  end
end
