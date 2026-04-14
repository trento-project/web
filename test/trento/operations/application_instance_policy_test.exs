defmodule Trento.Operations.ApplicationInstancePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Operations.Enums.SapInstanceOperations, as: SapInstanceOperations

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

    assert {:error, [%{message: "Unknown operation", metadata: []}]} ==
             ApplicationInstancePolicy.authorize_operation(:unknown, instance, %{})
  end

  test "should forbid operation if the host heartbeat where the application instance is running is not passing" do
    instance =
      build(:application_instance,
        host: build(:host, heartbeat: :critical)
      )

    for operation <- SapInstanceOperations.values() do
      assert {:error,
              [%{message: "Trento agent is not currently running in the host", metadata: []}]} ==
               ApplicationInstancePolicy.authorize_operation(operation, instance, %{})
    end
  end

  describe "sap_instance_start" do
    test "should authorize Message server start always" do
      instance =
        build(:application_instance,
          features: "MESSAGESERVER|ENQUE",
          host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
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
            {:error,
             [
               %{
                 message: "Message server #{instance_number} of SAP system #{sid} is not started",
                 metadata: []
               }
             ]}
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
            host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
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
        build(:application_instance,
          host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
        )

      sap_system =
        build(:sap_system,
          application_instances: [instance],
          database: build(:database, health: :passing)
        )

      assert {:error,
              [
                %{
                  message: "Message server not found in SAP system #{sid}",
                  metadata: []
                }
              ]} ==
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
            host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
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
      database_id = Faker.UUID.v4()
      sid = "PRD"

      scenarios = [
        %{database_health: :passing, result: :ok},
        %{
          database_health: :unknown,
          result:
            {:error,
             [
               %{
                 message: "Database {0} is not started",
                 metadata: [%{id: database_id, label: sid, type: :database}]
               }
             ]}
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
            host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
          )

        sap_system =
          build(:sap_system,
            application_instances: [message_server_instance, instance],
            database: build(:database, id: database_id, sid: sid, health: database_health)
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
          host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
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
          host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
        )

      [%{instance_number: inst_number_1}, %{instance_number: inst_number_2}] =
        other_instances = build_list(2, :application_instance, health: :passing)

      sap_system =
        build(:sap_system,
          application_instances: [instance | other_instances]
        )

      assert {:error,
              [
                %{
                  message: "Instance #{inst_number_1} of SAP system #{sid} is not stopped",
                  metadata: []
                },
                %{
                  message: "Instance #{inst_number_2} of SAP system #{sid} is not stopped",
                  metadata: []
                }
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
        host: build(:host, heartbeat: :passing, cluster: @empty_ascs_ers_cluster)
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
