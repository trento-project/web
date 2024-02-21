defmodule TrentoWeb.V2.ClusterView do
  use TrentoWeb, :view

  def render("clusters.json", %{clusters: clusters}) do
    render_many(clusters, __MODULE__, "cluster.json")
  end

  def render("cluster.json", %{cluster: cluster}) do
    cluster_details = render("cluster_details.json", %{details: cluster.details})

    cluster
    |> Map.from_struct()
    |> Map.put(:details, cluster_details)
    |> Map.delete(:deregistered_at)
    |> Map.delete(:__meta__)
  end

  def render("cluster_details.json", %{details: %{"sap_systems" => sap_systems} = details}) do
    sap_systems =
      Enum.map(sap_systems, &Map.take(&1, [:distributed, :filesystem_resource_based, :nodes]))

    Map.put(details, :sap_systems, sap_systems)
  end

  def render("cluster_details.json", %{details: details}) do
    details
  end

  def render("cluster_registered.json", %{cluster: cluster}) do
    Map.delete(render("cluster.json", %{cluster: cluster}), :tags)
  end

  def render("cluster_restored.json", %{cluster: cluster}) do
    render("cluster.json", %{cluster: cluster})
  end

  def render("cluster_details_updated.json", %{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.put(:id, data.cluster_id)
  end

  def render("cluster_health_changed.json", %{cluster: %{id: id, name: name, health: health}}) do
    %{cluster_id: id, name: name, health: health}
  end
end
