defmodule TrentoWeb.V2.ClusterJSON do
  alias Trento.Support.StructHelper

  def clusters(%{clusters: clusters}), do: Enum.map(clusters, &cluster(%{cluster: &1}))

  def cluster(%{cluster: cluster}) do
    cluster
    |> StructHelper.to_atomized_map()
    |> Map.delete(:deregistered_at)
    |> Map.delete(:hosts)
    |> adapt_details()
  end

  def cluster_registered(%{cluster: cluster}), do: Map.delete(cluster(%{cluster: cluster}), :tags)

  def cluster_restored(%{cluster: cluster}), do: cluster(%{cluster: cluster})

  def cluster_details_updated(%{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.delete(:hosts)
    |> Map.put(:id, data.cluster_id)
  end

  def cluster_health_changed(%{cluster: %{id: id, name: name, health: health}}),
    do: %{cluster_id: id, name: name, health: health}

  defp adapt_details(
         %{
           details: %{nodes: nodes, stopped_resources: stopped_resources} = details
         } =
           cluster
       ) do
    adapted_nodes = Enum.map(nodes, &adapt_node/1)
    adapted_stopped_resources = adapt_resources(stopped_resources)

    adapted_details =
      details
      |> Map.put(:nodes, adapted_nodes)
      |> Map.put(:stopped_resources, adapted_stopped_resources)

    %{cluster | details: adapted_details}
  end

  defp adapt_details(
         %{
           details: %{sap_systems: nodes, stopped_resources: stopped_resources} = details
         } =
           cluster
       ) do
    adapted_sap_systems = Enum.map(nodes, &adapt_sap_system/1)
    adapted_stopped_resources = adapt_resources(stopped_resources)

    adapted_details =
      details
      |> Map.put(:sap_systems, adapted_sap_systems)
      |> Map.put(:stopped_resources, adapted_stopped_resources)

    %{cluster | details: adapted_details}
  end

  defp adapt_details(cluster), do: cluster

  defp adapt_sap_system(%{nodes: nodes} = sap_system) do
    adapted_nodes = Enum.map(nodes, &adapt_node/1)

    Map.put(sap_system, :nodes, adapted_nodes)
  end

  defp adapt_node(%{resources: resources} = node) do
    adapted_resources = adapt_resources(resources)

    Map.put(node, :resources, adapted_resources)
  end

  defp adapt_resources(resources) do
    Enum.map(resources, &Map.drop(&1, [:parent]))
  end
end
