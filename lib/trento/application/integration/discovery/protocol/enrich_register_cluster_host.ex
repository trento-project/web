defimpl Trento.Support.Middleware.Enrichable,
  for: Trento.Domain.Commands.RegisterClusterHost do
  alias Trento.Domain.Commands.RegisterClusterHost

  @spec enrich(RegisterClusterHost.t(), map) :: {:ok, map} | {:error, any}
  def enrich(
        %RegisterClusterHost{cluster_id: cluster_id, cib_last_written: cib_last_written} =
          command,
        _
      ) do
    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_cib_last_written_updated", %{
      cluster_id: cluster_id,
      cib_last_written: cib_last_written
    })

    {:ok, command}
  end
end
