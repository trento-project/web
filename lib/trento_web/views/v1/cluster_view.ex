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
    adapted_nodes = Enum.map(nodes, &adapt_node/1)
    adapted_stopped_resources = Enum.map(stopped_resources, &Map.drop(&1, [:managed]))

    details
    |> Map.drop([:sites, :maintenance_mode])
    |> Map.put(:nodes, adapted_nodes)
    |> Map.put(:stopped_resources, adapted_stopped_resources)
  end

  defp adapt_node(%{resources: resources} = node) do
    adapted_resources = Enum.map(resources, &Map.drop(&1, [:managed]))

    node
    |> Map.drop([:indexserver_actual_role, :nameserver_actual_role, :status])
    |> Map.put(:resources, adapted_resources)
  end
end
