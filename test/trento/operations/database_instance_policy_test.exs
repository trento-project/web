defmodule Trento.Operations.DatabaseInstancePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Operations.DatabaseInstancePolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    instance = build(:database_instance)

    assert {:error, ["Unknown operation"]} ==
             DatabaseInstancePolicy.authorize_operation(:unknown, instance, %{})
  end

  describe "maintenance" do
    test "should forbid operation if the database instance is not stopped" do
      cluster_details =
        build(:hana_cluster_details, maintenance_mode: true, nodes: [])

      cluster = build(:cluster, details: cluster_details)

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:database_instance,
          health: Health.passing(),
          host: %HostReadModel{cluster: cluster}
        )

      assert {:error, ["Instance #{instance_number} of HANA database #{sid} is not stopped"]} ==
               DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{
                 cluster_resource_id: nil
               })
    end

    test "should authorize operation if the database instance is not clustered" do
      instance =
        build(:database_instance, health: Health.unknown(), host: %HostReadModel{cluster: nil})

      assert :ok == DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{})
    end

    test "should authorize operation if the cluster is in maintenance mode" do
      cluster_name = Faker.StarWars.character()

      scenarios = [
        %{maintenance_mode: true, result: :ok},
        %{
          maintenance_mode: false,
          result:
            {:error, ["Cluster #{cluster_name} operating this host is not in maintenance mode"]}
        }
      ]

      for %{maintenance_mode: maintenance_mode, result: result} <- scenarios do
        [%{sid: sid, instance_number: instance_number}] =
          clustered_sap_instances =
          build_list(1, :clustered_sap_instance)

        cluster_details =
          build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

        cluster =
          build(:cluster,
            name: cluster_name,
            sap_instances: clustered_sap_instances,
            details: cluster_details
          )

        instance =
          build(:database_instance,
            health: Health.unknown(),
            host: %HostReadModel{cluster: cluster},
            sid: sid,
            instance_number: instance_number
          )

        assert result ==
                 DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should forbid operation if the database instance is not stopped and cluster is not in maintenance" do
      cluster_name = Faker.StarWars.character()

      [%{sid: sid, instance_number: instance_number}] =
        clustered_sap_instances =
        build_list(1, :clustered_sap_instance)

      cluster_details =
        build(:hana_cluster_details, maintenance_mode: false, nodes: [])

      cluster =
        build(:cluster,
          name: cluster_name,
          sap_instances: clustered_sap_instances,
          details: cluster_details
        )

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:database_instance,
          health: Health.passing(),
          host: %HostReadModel{cluster: cluster},
          sid: sid,
          instance_number: instance_number
        )

      assert {:error,
              [
                "Instance #{instance_number} of HANA database #{sid} is not stopped",
                "Cluster #{cluster_name} operating this host is not in maintenance mode"
              ]} ==
               DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{
                 cluster_resource_id: nil
               })
    end
  end

  test "should authorize operation if the database instance is not clustered" do
    cluster_details =
      build(:hana_cluster_details, maintenance_mode: false)

    [%{sid: sid}] =
      clustered_sap_instances =
      build_list(1, :clustered_sap_instance, instance_number: "00")

    cluster =
      build(:cluster,
        type: :hana_scale_up,
        sap_instances: clustered_sap_instances,
        details: cluster_details
      )

    host = build(:host, cluster: cluster)

    instance =
      build(:database_instance,
        health: Health.unknown(),
        host: host,
        sid: sid,
        instance_number: "01"
      )

    assert :ok ==
             DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{})
  end

  test "should authorize operation if HANA resources are unmanaged" do
    cluster_name = Faker.StarWars.character()
    resource_id = Faker.UUID.v4()

    scenarios = [
      %{cluster_resource_type: "ocf::suse:SAPHana", managed: false, result: :ok},
      %{cluster_resource_type: "ocf::suse:SAPHanaController", managed: false, result: :ok},
      %{
        cluster_resource_type: "ocf::suse:SAPHana",
        managed: true,
        result:
          {:error,
           [
             "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
           ]}
      },
      %{
        cluster_resource_type: "ocf::suse:SAPHanaController",
        managed: true,
        result:
          {:error,
           [
             "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
           ]}
      }
    ]

    for %{cluster_resource_type: cluster_resource_type, managed: managed, result: result} <-
          scenarios do
      parent = build(:cluster_resource_parent, id: resource_id, managed: managed)

      cluster_resource =
        build(:cluster_resource, type: cluster_resource_type, parent: parent)

      [%{sid: sid, instance_number: instance_number}] =
        clustered_sap_instances =
        build_list(1, :clustered_sap_instance)

      cluster_details =
        build(:hana_cluster_details, maintenance_mode: false, resources: [cluster_resource])

      cluster =
        build(:cluster,
          name: cluster_name,
          sap_instances: clustered_sap_instances,
          details: cluster_details
        )

      host = build(:host, cluster: cluster)

      instance =
        build(:database_instance,
          health: Health.unknown(),
          host: host,
          sid: sid,
          instance_number: instance_number
        )

      assert result == DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{})
    end
  end
end
