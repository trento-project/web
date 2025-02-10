defmodule TrentoWeb.V2.ClusterJSONTest do
  use TrentoWeb.ConnCase, async: true
  import Trento.Factory

  alias TrentoWeb.V2.ClusterJSON

  alias Trento.Clusters.Projections.ClusterReadModel

  test "should render health changed relevant information" do
    %ClusterReadModel{id: id, name: name, health: health} = cluster = build(:cluster)

    assert %{cluster_id: id, name: name, health: health} ==
             ClusterJSON.cluster_health_changed(%{cluster: cluster})
  end

  test "should render maintenance_mode field" do
    details = build(:hana_cluster_details)

    cluster = build(:cluster, details: details)

    assert %{details: %{maintenance_mode: false}} =
             ClusterJSON.cluster(%{cluster: cluster})
  end

  test "should remove parent field from HANA clusters" do
    details = build(:hana_cluster_details)

    cluster = insert(:cluster, [type: :hana_scale_up, details: details], returning: true)

    %{
      details: %{
        nodes: [%{resources: resources}],
        stopped_resources: stopped_resources
      }
    } =
      ClusterJSON.cluster(%{cluster: cluster})

    Enum.each(stopped_resources, fn stopped_resource ->
      refute Map.has_key?(stopped_resource, :parent)
    end)

    Enum.each(resources, fn resource ->
      refute Map.has_key?(resource, :parent)
    end)
  end

  test "should remove parent field from ASCS/ERS clusters" do
    details = build(:ascs_ers_cluster_details)

    cluster = insert(:cluster, [type: :ascs_ers, details: details], returning: true)

    %{
      details: %{
        sap_systems: [%{nodes: [%{resources: resources} | _]} | _],
        stopped_resources: stopped_resources
      }
    } =
      ClusterJSON.cluster(%{cluster: cluster})

    Enum.each(stopped_resources, fn stopped_resource ->
      refute Map.has_key?(stopped_resource, :parent)
    end)

    Enum.each(resources, fn resource ->
      refute Map.has_key?(resource, :parent)
    end)
  end
end
