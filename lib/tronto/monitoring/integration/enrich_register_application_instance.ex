defimpl Tronto.Support.Middleware.Enrichable,
  for: Tronto.Monitoring.Domain.Commands.RegisterApplicationInstance do
  alias Tronto.Monitoring.Domain.Commands.RegisterApplicationInstance

  alias Tronto.Monitoring.DatabaseInstanceReadModel
  alias Tronto.Monitoring.HostReadModel

  alias Tronto.Repo
  import Ecto.Query

  @spec enrich(RegisterApplicationInstance.t(), map) :: {:ok, map} | {:error, any}
  def enrich(%RegisterApplicationInstance{db_host: db_host, tenant: tenant} = command, _) do
    # TODO: Move this to a separate service
    # TODO: change condition to use dbaddress
    query =
      from d in DatabaseInstanceReadModel,
        join: h in HostReadModel,
        on: d.host_id == h.id,
        where: (^db_host == h.hostname or ^db_host in h.ip_addresses) and ^tenant == d.tenant

    case Repo.one(query) do
      %DatabaseInstanceReadModel{sap_system_id: sap_system_id} ->
        {:ok, %RegisterApplicationInstance{command | sap_system_id: sap_system_id}}

      nil ->
        {:error, :database_not_found}

      {:error, _} = error ->
        error
    end
  end
end
