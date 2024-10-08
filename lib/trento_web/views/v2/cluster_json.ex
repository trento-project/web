defmodule TrentoWeb.V2.ClusterJSON do
  def clusters(%{clusters: clusters}) do
    Enum.map(clusters, &cluster(%{cluster: &1}))
  end

  def cluster(%{cluster: cluster}) do
    cluster
    |> Map.from_struct()
    |> Map.delete(:deregistered_at)
    |> Map.delete(:__meta__)
  end

  def cluster_registered(%{cluster: cluster}) do
    Map.delete(cluster(%{cluster: cluster}), :tags)
  end

  def cluster_restored(%{cluster: cluster}) do
    cluster(%{cluster: cluster})
  end

  def cluster_details_updated(%{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.put(:id, data.cluster_id)
  end

  def cluster_health_changed(%{cluster: %{id: id, name: name, health: health}}) do
    %{cluster_id: id, name: name, health: health}
  end
end
