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
        cluster_details =
          build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

        cluster = build(:cluster, name: cluster_name, details: cluster_details)

        instance =
          build(:database_instance,
            health: Health.unknown(),
            host: %HostReadModel{cluster: cluster}
          )

        assert result ==
                 DatabaseInstancePolicy.authorize_operation(:maintenance, instance, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should forbid operation if the database instance is not stopped and cluster is not in maintenance" do
      cluster_name = Faker.StarWars.character()

      cluster_details =
        build(:hana_cluster_details, maintenance_mode: false, nodes: [])

      cluster = build(:cluster, name: cluster_name, details: cluster_details)

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:database_instance,
          health: Health.passing(),
          host: %HostReadModel{cluster: cluster}
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
end
