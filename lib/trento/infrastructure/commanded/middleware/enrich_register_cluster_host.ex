defimpl Trento.Infrastructure.Commanded.Middleware.Enrichable,
  for: Trento.Clusters.Commands.RegisterClusterHost do
  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  alias Trento.Clusters.ValueObjects.{
    HanaClusterDetails,
    HanaClusterNode
  }

  alias Trento.Clusters.Commands.RegisterClusterHost

  alias Trento.Clusters

  @spec enrich(RegisterClusterHost.t(), map) :: {:ok, map} | {:error, any}
  def enrich(
        %RegisterClusterHost{
          cluster_id: cluster_id,
          cib_last_written: cib_last_written,
          type: type,
          sid: sid,
          details: details
        } = command,
        _
      ) do
    case Clusters.update_cib_last_written(cluster_id, cib_last_written) do
      {:ok, cluster} ->
        TrentoWeb.Endpoint.broadcast(
          "monitoring:clusters",
          "cluster_cib_last_written_updated",
          cluster
        )

      error ->
        error
    end

    {:ok,
     %RegisterClusterHost{
       command
       | details: strip_irrelevant_details(type, sid, details)
     }}
  end

  defp strip_irrelevant_details(
         ClusterType.hana_scale_up(),
         sid,
         %HanaClusterDetails{nodes: cluster_nodes} = details
       ) do
    %HanaClusterDetails{
      details
      | nodes: Enum.map(cluster_nodes, &strip_irrelevant_node_data(&1, sid))
    }
  end

  defp strip_irrelevant_details(_, _, details), do: details

  defp strip_irrelevant_node_data(
         %HanaClusterNode{attributes: attributes} = node,
         sid
       ) do
    %HanaClusterNode{
      node
      | attributes: Map.drop(attributes, ["lpa_#{String.downcase(sid)}_lpt"])
    }
  end
end
