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
          details: details
        } = command,
        _
      ) do
    {stripped_details, new_details} = strip_irrelevant_details(type, details)

    case Clusters.update_enrichment_data(cluster_id, %{
           cib_last_written: cib_last_written,
           nodes_attributes: stripped_details
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
         %HanaClusterDetails{nodes: cluster_nodes} = details
       ) do
    {stripped_nodes, ignored_nodes_attributes} =
      Enum.map_reduce(
        cluster_nodes,
        %{},
        fn %HanaClusterNode{name: node_name} = node, ignored_node_attributes ->
          {ignored_attributes, retained_attributes} = split_node_attributes(node)

          {
            %HanaClusterNode{
              node
              | attributes: retained_attributes
            },
            Map.put(ignored_node_attributes, node_name, ignored_attributes)
          }
        end
      )

    {ignored_nodes_attributes,
     %HanaClusterDetails{
       details
       | nodes: stripped_nodes
     }}
  end

  defp strip_irrelevant_details(_, details), do: {%{}, details}

  defp split_node_attributes(%HanaClusterNode{attributes: attributes}) do
    Map.split_with(attributes, fn {key, _value} ->
      String.starts_with?(key, "lpa_") and String.ends_with?(key, "_lpt")
    end)
  end
end
