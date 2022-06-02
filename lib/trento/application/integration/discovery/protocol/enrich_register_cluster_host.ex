defimpl Trento.Support.Middleware.Enrichable,
  for: Trento.Domain.Commands.RegisterClusterHost do
  alias Trento.Domain.Commands.RegisterClusterHost

  alias Trento.Clusters

  @spec enrich(RegisterClusterHost.t(), map) :: {:ok, map} | {:error, any}
  def enrich(
        %RegisterClusterHost{cluster_id: cluster_id, cib_last_written: cib_last_written} =
          command,
        _
      ) do
    case Clusters.update_cib_last_written(cluster_id, cib_last_written) do
      {:ok, _} ->
        TrentoWeb.Endpoint.broadcast("monitoring:clusters", "cluster_cib_last_written_updated", %{
          cluster_id: cluster_id,
          cib_last_written: cib_last_written
        })

      {:error, :cluster_not_found} ->
        nil

      error ->
        error
    end

    {:ok, command}
  end
end
