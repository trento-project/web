defmodule TrentoWeb.V2.ClusterJSONTest do
  use TrentoWeb.ConnCase, async: true
  import Trento.Factory

  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  alias TrentoWeb.V2.ClusterJSON

  alias Trento.Clusters.Projections.ClusterReadModel

  test "should render health changed relevant information" do
    %ClusterReadModel{id: id, name: name, health: health} = cluster = build(:cluster)

    assert %{cluster_id: id, name: name, health: health} ==
             ClusterJSON.cluster_health_changed(%{cluster: cluster})
  end

  test "should render maintenance_mode field" do
    details = build(:hana_cluster_details)

    cluster = insert(:cluster, [details: details], returning: true)

    assert %{details: %{maintenance_mode: false}} =
             ClusterJSON.cluster(%{cluster: cluster})
  end

  test "should render sap instances and deprecated sids properly" do
    sap_instances = [
      %{sid: sid_1, instance_number: inr_1} =
        build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_instance()),
      %{sid: sid_2, instance_number: inr_2} =
        build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_hana_topology()),
      %{sid: sid_3, instance_number: inr_3} =
        build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_instance())
    ]

    cluster = build(:cluster, sap_instances: sap_instances)

    %{
      sap_instances: view_sap_instances,
      sid: sid,
      additional_sids: additional_sids
    } =
      ClusterJSON.cluster(%{cluster: cluster})

    assert sid_2 == sid
    assert [sid_1, sid_3] == additional_sids

    assert [
             %{sid: sid_1, instance_number: inr_1},
             %{sid: sid_2, instance_number: inr_2},
             %{sid: sid_3, instance_number: inr_3}
           ] == view_sap_instances
  end

  test "should remove sid from resources" do
    details = build(:hana_cluster_details)
    cluster = build(:cluster, details: details)

    %{
      details: %{resources: resources}
    } =
      ClusterJSON.cluster(%{cluster: cluster})

    Enum.each(resources, fn resource ->
      refute Map.has_key?(resource, :sid)
    end)
  end
end
