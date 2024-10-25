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
    {stripped_details, new_details} = strip_irrelevant_details(type, sid, details)

    case Clusters.update_enrichment_data(cluster_id, %{
           cib_last_written: cib_last_written,
           details: stripped_details
         }) do
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
       | details: new_details
     }}
  end

  defp strip_irrelevant_details(
         ClusterType.hana_scale_up(),
         sid,
         %HanaClusterDetails{nodes: cluster_nodes} = details
       ) do
    {stripped_nodes, new_nodes} =
      cluster_nodes
      |> Enum.map(&strip_irrelevant_nodes_data(&1, sid))
      |> Enum.unzip()

    {%{nodes: stripped_nodes},
     %HanaClusterDetails{
       details
       | nodes: new_nodes
     }}
  end

  defp strip_irrelevant_details(_, _, details), do: {%{}, details}

  defp strip_irrelevant_nodes_data(
         %HanaClusterNode{name: node_name, attributes: attributes} = node,
         sid
       ) do
    {stripped_attributes, new_attributes} =
      Map.split_with(attributes, fn {key, _value} -> key == "lpa_#{String.downcase(sid)}_lpt" end)

    {
      %{name: node_name, attributes: stripped_attributes},
      %HanaClusterNode{
        node
        | attributes: new_attributes
      }
    }
  end
end
