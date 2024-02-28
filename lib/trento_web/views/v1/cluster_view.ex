defmodule TrentoWeb.V1.ClusterView do
  use TrentoWeb, :view

  def render("clusters.json", %{clusters: clusters}) do
    render_many(clusters, __MODULE__, "cluster.json")
  end

  def render("cluster.json", %{cluster: cluster}) do
    cluster
    |> Map.from_struct()
    |> Map.delete(:deregistered_at)
    |> Map.delete(:__meta__)
    |> adapt_v1()
  end

  def render("cluster_registered.json", %{cluster: cluster}) do
    Map.delete(render("cluster.json", %{cluster: cluster}), :tags)
  end

  def render("cluster_details_updated.json", %{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.put(:id, data.cluster_id)
  end

  defp adapt_v1(%{type: type, details: nil} = cluster)
       when type in [:hana_scale_up, :hana_scale_out, :unknown] do
    cluster
  end

  defp adapt_v1(%{type: type, details: details} = cluster)
       when type in [:hana_scale_up, :hana_scale_out] do
    adapted_details = adapt_details(details)
    %{cluster | details: adapted_details}
  end

  defp adapt_v1(cluster) do
    cluster
    |> Map.replace(:type, :unknown)
    |> Map.replace(:details, nil)
  end

  defp adapt_details(%{nodes: nodes, stopped_resources: stopped_resources} = details) do
    details
    |> Map.drop([:sites, :maintenance_mode])
    |> Map.put(:nodes, adapt_nodes(nodes))
    |> Map.put(:stopped_resources, adapt_resources(stopped_resources))
  end

  defp adapt_details(%{nodes: nodes} = details) do
    details
    |> Map.drop([:sites, :maintenance_mode])
    |> Map.put(:nodes, adapt_nodes(nodes))
  end

  defp adapt_nodes(nodes) do
    Enum.map(nodes, &adapt_node(&1))
  end

  defp adapt_node(node) do
    adapted_resources = adapt_resources(node[:resources] || [])

    Map.drop(node, [:indexserver_actual_role, :nameserver_actual_role, :status])
    |> Map.put(:resources, adapted_resources)
  end

  defp adapt_resources(resources) do
    Enum.map(resources, &Map.drop(&1, [:managed]))
  end
end
