defmodule TrentoWeb.V1.ClusterJSON do
  alias Trento.Support.StructHelper

  def clusters(%{clusters: clusters}) do
    Enum.map(clusters, &cluster(%{cluster: &1}))
  end

  def cluster(%{cluster: cluster}) do
    cluster
    |> StructHelper.to_atomized_map()
    |> Map.delete(:deregistered_at)
    |> Map.delete(:__meta__)
    |> adapt_v1()
  end

  def cluster_registered(%{cluster: cluster}) do
    Map.delete(TrentoWeb.V1.ClusterJSON.cluster(%{cluster: cluster}), :tags)
  end

  def cluster_details_updated(%{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.put(:id, data.cluster_id)
  end

  defp adapt_v1(%{type: type, details: nil} = cluster)
       when type in [:hana_scale_up, :hana_scale_out, :unknown] do
    cluster
  end

  defp adapt_v1(
         %{type: type, details: %{nodes: nodes, stopped_resources: stopped_resources} = details} =
           cluster
       )
       when type in [:hana_scale_up, :hana_scale_out] do
    adapted_nodes = Enum.map(nodes, &adapt_node/1)
    adapted_stopped_resources = adapt_resources(stopped_resources)

    adapted_details =
      details
      |> Map.drop([:sites, :maintenance_mode, :architecture_type, :hana_scenario])
      |> Map.put(:nodes, adapted_nodes)
      |> Map.put(:stopped_resources, adapted_stopped_resources)

    %{cluster | details: adapted_details}
  end

  defp adapt_v1(cluster) do
    cluster
    |> Map.replace(:type, :unknown)
    |> Map.replace(:details, nil)
  end

  defp adapt_node(%{resources: resources} = node) do
    adapted_resources = adapt_resources(resources)

    node
    |> Map.drop([:indexserver_actual_role, :nameserver_actual_role, :status])
    |> Map.put(:resources, adapted_resources)
  end

  defp adapt_resources(resources) do
    Enum.map(resources, &Map.drop(&1, [:managed]))
  end
end
