defmodule TrentoWeb.V2.ClusterJSON do
  alias Trento.Clusters.ValueObjects.SapInstance

  def clusters(%{clusters: clusters}), do: Enum.map(clusters, &cluster(%{cluster: &1}))

  def cluster(%{cluster: cluster}) do
    cluster
    |> Map.from_struct()
    |> Map.delete(:deregistered_at)
    |> Map.delete(:hosts)
    |> Map.delete(:__meta__)
    |> adapt_sids()
  end

  def cluster_registered(%{cluster: cluster}), do: Map.delete(cluster(%{cluster: cluster}), :tags)

  def cluster_restored(%{cluster: cluster}), do: cluster(%{cluster: cluster})

  def cluster_details_updated(%{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.put(:id, data.cluster_id)
    |> adapt_sids()
  end

  def cluster_health_changed(%{cluster: %{id: id, name: name, health: health}}),
    do: %{cluster_id: id, name: name, health: health}

  defp adapt_sids(%{sap_instances: sap_instances} = cluster) do
    adapted_sap_instances =
      Enum.map(sap_instances, fn %{sid: sid, instance_number: instance_number} ->
        %{sid: sid, instance_number: instance_number}
      end)

    cluster
    |> Map.put(:sid, SapInstance.get_hana_instance_sid(sap_instances))
    |> Map.put(:additional_sids, SapInstance.get_sap_instance_sids(sap_instances))
    |> Map.put(:sap_instances, adapted_sap_instances)
  end
end
