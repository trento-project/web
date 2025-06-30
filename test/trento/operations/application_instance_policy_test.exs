defmodule Trento.Operations.ApplicationInstancePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Operations.ApplicationInstancePolicy

  import Trento.Factory

  @empty_ascs_ers_cluster build(:cluster,
                            details:
                              build(:ascs_ers_cluster_details,
                                maintenance_mode: true,
                                sap_systems: []
                              )
                          )

  test "should forbid unknown operation" do
    instance = build(:application_instance)

    assert {:error, ["Unknown operation"]} ==
             ApplicationInstancePolicy.authorize_operation(:unknown, instance, %{})
  end

  describe "maintenance" do
    test "should forbid operation if the application instance is not stopped" do
      sap_systems = build_list(1, :ascs_ers_cluster_sap_system)

      cluster_details =
        build(:ascs_ers_cluster_details, maintenance_mode: true, sap_systems: sap_systems)

      cluster = build(:cluster, details: cluster_details)

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:application_instance,
          health: Health.passing(),
          host: build(:host, cluster: cluster)
        )

      assert {:error, ["Instance #{instance_number} of SAP system #{sid} is not stopped"]} ==
               ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{
                 cluster_resource_id: nil
               })
    end

    test "should authorize operation if the application instance is not clustered" do
      instance =
        build(:application_instance, health: Health.unknown(), host: build(:host, cluster: nil))

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
        sap_systems = build_list(1, :ascs_ers_cluster_sap_system)

        cluster_details =
          build(:ascs_ers_cluster_details,
            maintenance_mode: maintenance_mode,
            sap_systems: sap_systems
          )

        [%{sid: sid, instance_number: instance_number}] =
          clustered_sap_instances =
          build_list(1, :clustered_sap_instance)

        cluster =
          build(:cluster,
            name: cluster_name,
            details: cluster_details,
            sap_instances: clustered_sap_instances
          )

        instance =
          build(:application_instance,
            health: Health.unknown(),
            host: build(:host, cluster: cluster),
            instance_number: instance_number,
            sid: sid
          )

        assert result ==
                 ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should authorize operation if the cluster SAPInstance resource is unmanaged" do
      cluster_name = Faker.StarWars.character()
      resource_id = Faker.UUID.v4()
      sid = "PRD"

      scenarios = [
        %{managed: false, result: :ok},
        %{
          managed: true,
          result:
            {:error,
             [
               "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
             ]}
        }
      ]

      for %{managed: managed, result: result} <- scenarios do
        resources =
          build_list(1, :cluster_resource,
            id: resource_id,
            type: "ocf::heartbeat:SAPInstance",
            managed: managed,
            sid: sid
          )

        cluster_details =
          build(:ascs_ers_cluster_details, maintenance_mode: false, resources: resources)

        [%{instance_number: instance_number}] =
          clustered_sap_instances =
          build_list(1, :clustered_sap_instance, sid: sid)

        cluster =
          build(:cluster,
            name: cluster_name,
            type: :ascs_ers,
            details: cluster_details,
            sap_instances: clustered_sap_instances
          )

        host = build(:host, cluster: cluster)

        instance =
          build(:application_instance,
            health: Health.unknown(),
            host: host,
            sid: sid,
            instance_number: instance_number
          )

        assert result ==
                 ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{})
      end
    end

    test "should authorize operation if the SAP instance is not clustered" do
      [%{sid: sid}] = sap_systems = build_list(1, :ascs_ers_cluster_sap_system)

      cluster_details =
        build(:ascs_ers_cluster_details, maintenance_mode: false, sap_systems: sap_systems)

      clustered_sap_instances =
        build_list(1, :clustered_sap_instance, sid: sid, instance_number: "00")

      cluster =
        build(:cluster,
          type: :ascs_ers,
          details: cluster_details,
          sap_instances: clustered_sap_instances
        )

      host = build(:host, cluster: cluster)

      instance =
        build(:application_instance,
          health: Health.unknown(),
          host: host,
          sid: sid,
          instance_number: "01"
        )

      assert :ok ==
               ApplicationInstancePolicy.authorize_operation(:maintenance, instance, %{})
    end

    test "should forbid operation if the application instance is not stopped and cluster is not in maintenance" do
      cluster_name = Faker.StarWars.character()
      [%{sid: sid}] = sap_systems = build_list(1, :ascs_ers_cluster_sap_system)

      cluster_details =
        build(:ascs_ers_cluster_details, maintenance_mode: false, sap_systems: sap_systems)

      [%{instance_number: instance_number}] =
        clustered_sap_instances =
        build_list(1, :clustered_sap_instance, sid: sid)

      cluster =
        build(:cluster,
          name: cluster_name,
          details: cluster_details,
          sap_instances: clustered_sap_instances
        )

      %{sid: sid, instance_number: instance_number} =
        instance =
        build(:application_instance,
          health: Health.passing(),
          host: build(:host, cluster: cluster),
          instance_number: instance_number,
          sid: sid
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

  describe "sap_instance_start" do
    test "should authorize Message server start always" do
      instance =
        build(:application_instance,
          features: "MESSAGESERVER|ENQUE",
          host: build(:host, cluster: @empty_ascs_ers_cluster)
        )

      assert :ok ==
               ApplicationInstancePolicy.authorize_operation(:sap_instance_start, instance, %{})
    end

    test "should authorize other instances start depending on Message server running status" do
      instance_number = "00"
      sid = "PRD"

      scenarios = [
        %{health: :passing, result: :ok},
        %{
          health: :unknown,
          result:
            {:error, ["Message server #{instance_number} of SAP system #{sid} is not started"]}
        }
      ]

      for %{health: health, result: result} <- scenarios do
        message_server_instance =
          build(:application_instance,
            instance_number: instance_number,
            health: health,
            features: "MESSAGESERVER|ENQUE"
          )

        instance =
          build(:application_instance,
            sid: sid,
            host: build(:host, cluster: @empty_ascs_ers_cluster)
          )

        sap_system =
          build(:sap_system,
            application_instances: [message_server_instance, instance],
            database: build(:database, health: :passing)
          )

        assert result ==
                 ApplicationInstancePolicy.authorize_operation(
                   :sap_instance_start,
                   %{instance | sap_system: sap_system},
                   %{}
                 )
      end
    end

    test "should forbid other instances start if Message server is not found" do
      %{sid: sid} =
        instance =
        build(:application_instance, host: build(:host, cluster: @empty_ascs_ers_cluster))

      sap_system =
        build(:sap_system,
          application_instances: [instance],
          database: build(:database, health: :passing)
        )

      assert {:error, ["Message server not found in SAP system #{sid}"]} ==
               ApplicationInstancePolicy.authorize_operation(
                 :sap_instance_start,
                 %{instance | sap_system: sap_system},
                 %{}
               )
    end

    test "should authorize Enque replication start if Message server is running and no matter the database state" do
      for database_health <- [:unknown, :passing] do
        message_server_instance =
          build(:application_instance,
            health: :passing,
            features: "MESSAGESERVER|ENQUE"
          )

        instance =
          build(:application_instance,
            features: "ENQREP",
            host: build(:host, cluster: @empty_ascs_ers_cluster)
          )

        sap_system =
          build(:sap_system,
            application_instances: [message_server_instance, instance],
            database: build(:database, health: database_health)
          )

        assert :ok ==
                 ApplicationInstancePolicy.authorize_operation(
                   :sap_instance_start,
                   %{instance | sap_system: sap_system},
                   %{}
                 )
      end
    end

    test "should authorize other instances start depending on database running state" do
      sid = "PRD"

      scenarios = [
        %{database_health: :passing, result: :ok},
        %{
          database_health: :unknown,
          result: {:error, ["Database #{sid} is not started"]}
        }
      ]

      for %{database_health: database_health, result: result} <- scenarios do
        message_server_instance =
          build(:application_instance,
            health: :passing,
            features: "MESSAGESERVER|ENQUE"
          )

        instance =
          build(:application_instance,
            host: build(:host, cluster: @empty_ascs_ers_cluster)
          )

        sap_system =
          build(:sap_system,
            application_instances: [message_server_instance, instance],
            database: build(:database, sid: sid, health: database_health)
          )

        assert result ==
                 ApplicationInstancePolicy.authorize_operation(
                   :sap_instance_start,
                   %{instance | sap_system: sap_system},
                   %{}
                 )
      end
    end
  end

  describe "sap_instance_stop" do
    test "should authorize Message server stop if the other instances are stopped" do
      instance =
        build(:application_instance,
          features: "MESSAGESERVER|ENQUE",
          host: build(:host, cluster: @empty_ascs_ers_cluster)
        )

      other_instances = build_list(2, :application_instance, health: :unknown)

      sap_system =
        build(:sap_system,
          application_instances: [instance | other_instances]
        )

      assert :ok ==
               ApplicationInstancePolicy.authorize_operation(
                 :sap_instance_stop,
                 %{instance | sap_system: sap_system},
                 %{}
               )
    end

    test "should forbid Message server stop if the other instances are running" do
      %{sid: sid} =
        instance =
        build(:application_instance,
          features: "MESSAGESERVER|ENQUE",
          host: build(:host, cluster: @empty_ascs_ers_cluster)
        )

      [%{instance_number: inst_number_1}, %{instance_number: inst_number_2}] =
        other_instances = build_list(2, :application_instance, health: :passing)

      sap_system =
        build(:sap_system,
          application_instances: [instance | other_instances]
        )

      assert {:error,
              [
                "Instance #{inst_number_1} of SAP system #{sid} is not stopped",
                "Instance #{inst_number_2} of SAP system #{sid} is not stopped"
              ]} ==
               ApplicationInstancePolicy.authorize_operation(
                 :sap_instance_stop,
                 %{instance | sap_system: sap_system},
                 %{}
               )
    end
  end

  test "should authorize other instances stop" do
    instance =
      build(:application_instance,
        host: build(:host, cluster: @empty_ascs_ers_cluster)
      )

    other_instances = build_list(2, :application_instance, health: :unknown)

    sap_system =
      build(:sap_system,
        application_instances: [instance | other_instances]
      )

    assert :ok ==
             ApplicationInstancePolicy.authorize_operation(
               :sap_instance_stop,
               %{instance | sap_system: sap_system},
               %{}
             )
  end
end
