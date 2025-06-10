defmodule Trento.Operations.ApplicationInstancePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Operations.ApplicationInstancePolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    instance = build(:application_instance)

    assert {:error, ["Unknown operation"]} ==
             ApplicationInstancePolicy.authorize_operation(:unknown, instance, %{})
  end

  describe "maintenance" do
    test "should forbid operation if the application instance is not stopped" do
      cluster_details =
        build(:hana_cluster_details, maintenance_mode: true, nodes: [])

      cluster = build(:cluster, details: cluster_details)

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:application_instance,
          health: Health.passing(),
          host: %HostReadModel{cluster: cluster}
        )

      assert {:error, ["Instance #{instance_number} of SAP system #{sid} is not stopped"]} ==
               ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{
                 cluster_resource_id: nil
               })
    end

    test "should authorize operation if the application instance is not clustered" do
      instance =
        build(:application_instance, health: Health.unknown(), host: %HostReadModel{cluster: nil})

      assert :ok == ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{})
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
        cluster_details =
          build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

        cluster = build(:cluster, name: cluster_name, details: cluster_details)

        instance =
          build(:application_instance,
            health: Health.unknown(),
            host: %HostReadModel{cluster: cluster}
          )

        assert result ==
                 ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should forbid operation if the application instance is not stopped and cluster is not in maintenance" do
      cluster_name = Faker.StarWars.character()

      cluster_details =
        build(:hana_cluster_details, maintenance_mode: false, nodes: [])

      cluster = build(:cluster, name: cluster_name, details: cluster_details)

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:application_instance,
          health: Health.passing(),
          host: %HostReadModel{cluster: cluster}
        )

      assert {:error,
              [
                "Instance #{instance_number} of SAP system #{sid} is not stopped",
                "Cluster #{cluster_name} operating this host is not in maintenance mode"
              ]} ==
               ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{
                 cluster_resource_id: nil
               })
    end
  end

  describe "SAP instance start" do
    test "should authorize SAP instance start operation" do
      instance = build(:application_instance)

      assert :ok ==
               ApplicationInstancePolicy.authorize_operation(:sap_instance_start, instance, %{})
    end
  end

  describe "SAP instance stop" do
    test "should authorize SAP instance stop operation" do
      instance = build(:application_instance)

      assert :ok ==
               ApplicationInstancePolicy.authorize_operation(:sap_instance_stop, instance, %{})
    end
  end
end
