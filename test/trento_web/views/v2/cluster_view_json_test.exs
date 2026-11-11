# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

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

  @scenarios [
    %{
      name: "cluster",
      view_fn: &ClusterJSON.cluster/1,
      view_arg_name: :cluster,
      view_arg_factory_name: :cluster
    },
    %{
      name: "cluster_details_updated",
      view_fn: &ClusterJSON.cluster_details_updated/1,
      view_arg_name: :data,
      view_arg_factory_name: :cluster_details_updated_event
    }
  ]
  for scenario <- @scenarios do
    @scenario scenario

    test "#{scenario.name} view should render sap instances and deprecated sids properly" do
      %{
        view_fn: view_fn,
        view_arg_name: view_arg_name,
        view_arg_factory_name: view_arg_factory_name
      } = @scenario

      sap_instances = [
        %{sid: sid_1, instance_number: inr_1} =
          build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_instance()),
        %{sid: sid_2, instance_number: inr_2} =
          build(:clustered_sap_instance,
            resource_type: SapInstanceResourceType.sap_hana_topology()
          ),
        %{sid: sid_3, instance_number: inr_3} =
          build(:clustered_sap_instance, resource_type: SapInstanceResourceType.sap_instance())
      ]

      data = build(view_arg_factory_name, sap_instances: sap_instances)

      %{sap_instances: view_sap_instances, sid: sid, additional_sids: additional_sids} =
        view_fn.(%{view_arg_name => data})

      assert sid_2 == sid
      assert [sid_1, sid_3] == additional_sids

      assert [
               %{sid: sid_1, instance_number: inr_1},
               %{sid: sid_2, instance_number: inr_2},
               %{sid: sid_3, instance_number: inr_3}
             ] == view_sap_instances
    end
  end

  test "cluster view should remove sid from resources" do
    details = build(:hana_cluster_details)
    cluster = build(:cluster, details: details)

    %{
      details: %{resources: resources}
    } =
      ClusterJSON.cluster(%{cluster: cluster})

    Enum.each(resources, fn resource ->
      refute Map.has_key?(resource, :sid)
      refute Map.has_key?(resource, :__struct__)
    end)
  end

  @scenarios [
    %{
      name: "HANA",
      factory: :hana_cluster_health_details_projection,
      health_fields: [:checks_health, :sbd_health, :replication_health]
    }
  ]
  for scenario <- @scenarios do
    @scenario scenario

    test "cluster_health_details_changed renders correctly" do
      id = Faker.UUID.v4()
      health_details_projection = build(@scenario.factory)

      data =
        ClusterJSON.cluster_health_details_changed(%{
          cluster_id: id,
          health_details: health_details_projection,
          type: :hana_scale_up,
          selected_checks: [Faker.UUID.v4()],
          details: %{sbd_devices: [%{device: "/dev/sdb", status: "healthy"}]}
        })

      expected_health_details =
        for field <- @scenario.health_fields,
            into: %{},
            do: {field, %{value: Map.fetch!(health_details_projection, field).value}}

      assert %{cluster_id: id, health_details: expected_health_details} == data
    end
  end

  describe "not applicable health factors" do
    test "should render checks health as not applicable when no checks are selected" do
      cluster = build(:cluster, type: :hana_scale_up, selected_checks: [])

      assert %{health_details: %{checks_health: %{value: :not_applicable}}} =
               ClusterJSON.cluster(%{cluster: cluster})
    end

    test "should render SBD health as not applicable when the cluster has no SBD devices" do
      for details <- [%{sbd_devices: []}, nil] do
        cluster = build(:cluster, type: :ascs_ers, details: details)

        assert %{health_details: %{sbd_health: %{value: :not_applicable}}} =
                 ClusterJSON.cluster(%{cluster: cluster})
      end
    end

    test "should render the stored values when checks are selected and SBD devices exist" do
      %{health_details: health_details} =
        cluster =
        build(:cluster,
          type: :hana_scale_up,
          selected_checks: [Faker.UUID.v4()],
          details: %{sbd_devices: [%{device: "/dev/sdb", status: "healthy"}]}
        )

      assert %{health_details: ^health_details} = ClusterJSON.cluster(%{cluster: cluster})
    end

    test "should render nil health details for a cluster of a type without health details" do
      cluster =
        build(:cluster,
          type: :unknown,
          health_details: build(:hana_cluster_health_details_projection)
        )

      assert %{health_details: nil} = ClusterJSON.cluster(%{cluster: cluster})
    end

    test "should apply not applicable in the health details changed payload" do
      id = Faker.UUID.v4()

      %{replication_health: %{value: replication_health}} =
        health_details = build(:hana_cluster_health_details_projection)

      assert %{
               cluster_id: ^id,
               health_details: %{
                 checks_health: %{value: :not_applicable},
                 sbd_health: %{value: :not_applicable},
                 replication_health: %{value: ^replication_health}
               }
             } =
               ClusterJSON.cluster_health_details_changed(%{
                 cluster_id: id,
                 health_details: health_details,
                 type: :hana_scale_up,
                 selected_checks: [],
                 details: %{sbd_devices: []}
               })
    end

    test "should render nil health details in the changed payload when the row has none" do
      id = Faker.UUID.v4()

      assert %{cluster_id: ^id, health_details: nil} =
               ClusterJSON.cluster_health_details_changed(%{
                 cluster_id: id,
                 health_details: nil,
                 type: :hana_scale_up,
                 selected_checks: [],
                 details: nil
               })
    end
  end
end
