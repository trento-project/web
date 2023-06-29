defmodule TrentoWeb.V1.ClusterView do
  use TrentoWeb, :view

  def render("clusters.json", %{clusters: clusters}) do
    render_many(clusters, __MODULE__, "cluster.json")
  end

  def render("cluster.json", %{cluster: cluster}) do
    cluster
    |> Map.from_struct()
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

  defp adapt_v1(%{type: type} = cluster) when type in [:hana_scale_up, :hana_scale_out, :unknown],
    do: cluster

  defp adapt_v1(cluster) do
    cluster
    |> Map.replace(:type, :unknown)
    |> Map.replace(:details, nil)
  end
end
