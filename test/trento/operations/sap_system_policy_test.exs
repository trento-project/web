defmodule Trento.Operations.SapSystemPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health
  require Trento.Operations.Enums.SapSystemOperations, as: SapSystemOperations

  alias Trento.Operations.SapSystemPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    sap_system = build(:sap_system)

    assert {:error, [%{message: "Unknown operation", metadata: []}]} ==
             SapSystemPolicy.authorize_operation(:unknown, sap_system, %{})
  end

  test "should forbid operation if any of the hosts heartbeat where the sap system is running is not passing" do
    sap_system =
      build(:sap_system,
        application_instances: [
          build(:application_instance, host: build(:host, heartbeat: :critical)),
          build(:application_instance, host: build(:host, heartbeat: :critical))
        ]
      )

    for operation <- SapSystemOperations.values() do
      assert {:error,
              [
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the SAP system",
                  metadata: []
                }
              ]} ==
               SapSystemPolicy.authorize_operation(operation, sap_system, %{})
    end
  end

  test "should continue checking policies if at least one host heartbeat in the sap system is passing" do
    sap_system =
      build(:sap_system,
        database_instances: [],
        application_instances: [
          build(:application_instance, host: build(:host, heartbeat: :passing)),
          build(:application_instance, host: build(:host, heartbeat: :critical))
        ]
      )

    for operation <- SapSystemOperations.values() do
      refute {:error,
              [
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the SAP system",
                  metadata: []
                }
              ]} ==
               SapSystemPolicy.authorize_operation(operation, sap_system, %{})
    end
  end

  describe "sap_system_start" do
    test "should forbid operation if the application cluster is not in maintenance" do
      %{
        id: cluster_id,
        name: cluster_name,
        sap_instances: [%{sid: sid, instance_number: instance_number}],
        details: %{resources: [%{id: resource_id}]}
      } =
        cluster = build_cluster_with_maintenance(false)

      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
        )

      assert {:error,
              [
                %{
                  message:
                    "Cluster {0} or resource #{resource_id} operating this host are not in maintenance mode",
                  metadata: [%{id: cluster_id, label: cluster_name, type: :cluster}]
                }
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should forbid operation if database without system replication is not started" do
      sap_system =
        build(:sap_system,
          database_instances: [
            %{database_id: database_id, sid: sid} =
              build(:database_instance,
                health: Health.unknown(),
                system_replication: nil
              )
          ],
          application_instances:
            build_list(2, :application_instance,
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
        )

      assert {:error,
              [
                %{
                  message: "Database {0} is not started",
                  metadata: [%{id: database_id, label: sid, type: :database}]
                }
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should forbid operation if database with system replication is not started" do
      sap_system =
        build(:sap_system,
          database_instances: [
            %{database_id: database_id, sid: sid} =
              build(:database_instance,
                health: Health.unknown(),
                system_replication: "Primary",
                system_replication_site: "Site1"
              ),
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Secondary"
            )
          ],
          application_instances:
            build_list(2, :application_instance,
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
        )

      assert {:error,
              [
                %{
                  message: "Database {0} primary site Site1 is not started",
                  metadata: [%{id: database_id, label: sid, type: :database}]
                }
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should forbid operation if the message server is not started for other type start request" do
      %{id: sap_system_id} =
        sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances: [
            %{sid: sid, instance_number: inst_number} =
              build(:application_instance,
                health: Health.unknown(),
                features: "MESSAGESERVER|ENQUE",
                host: build(:host, heartbeat: :passing, cluster: nil)
              )
          ]
        )

      assert {:error,
              [
                %{
                  message: "Instance #{inst_number} of SAP system {0} is not started",
                  metadata: [%{id: sap_system_id, label: sid, type: :sap_system}]
                }
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation if cluster is in maintenance" do
      %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(true)

      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should authorize operation if cluster is not in maintenance and the request is for application instances" do
      for instance_type <- ["abap", "j2ee"] do
        %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
          cluster = build_cluster_with_maintenance(false)

        sap_system =
          build(:sap_system,
            database_instances: [],
            application_instances:
              build_list(2, :application_instance,
                sid: sid,
                instance_number: instance_number,
                host: build(:host, heartbeat: :passing, cluster: cluster)
              )
          )

        assert :ok ==
                 SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                   instance_type: instance_type
                 })
      end
    end

    test "should authorize operation if the database is started" do
      sap_system =
        build(:sap_system,
          database_instances: [
            build(:database_instance,
              health: Health.passing(),
              system_replication: nil
            )
          ],
          application_instances:
            build_list(2, :application_instance,
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{})
    end

    test "should authorize operation if message server is started" do
      sap_system =
        build(:sap_system,
          database_instances: [],
          application_instances: [
            build(:application_instance,
              health: Health.passing(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation if message server is stopped but the request will start it" do
      scenarios = [
        %{},
        %{instance_type: "scs"},
        %{instance_type: "all"}
      ]

      for params <- scenarios do
        sap_system =
          build(:sap_system,
            database_instances: [],
            application_instances: [
              build(:application_instance,
                health: Health.unknown(),
                features: "MESSAGESERVER|ENQUE",
                host: build(:host, heartbeat: :passing, cluster: nil)
              )
            ]
          )

        assert :ok ==
                 SapSystemPolicy.authorize_operation(:sap_system_start, sap_system, params)
      end
    end
  end

  describe "sap_system_stop" do
    test "should forbid operation if the application cluster is not in maintenance" do
      %{
        id: cluster_id,
        name: cluster_name,
        sap_instances: [%{sid: sid, instance_number: instance_number}],
        details: %{resources: [%{id: resource_id}]}
      } =
        cluster = build_cluster_with_maintenance(false)

      sap_system =
        build(:sap_system,
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
        )

      assert {:error,
              [
                %{
                  message:
                    "Cluster {0} or resource #{resource_id} operating this host are not in maintenance mode",
                  metadata: [%{id: cluster_id, label: cluster_name, type: :cluster}]
                }
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should forbid operation if other instances are not stopped and the request is for the message server" do
      %{id: sap_system_id} =
        sap_system =
        build(:sap_system,
          application_instances: [
            %{sid: sid, instance_number: inst_number} =
              build(:application_instance,
                health: Health.passing(),
                features: "ABAP|GATEWAY|ICMAN|IGS",
                host: build(:host, heartbeat: :passing, cluster: nil)
              ),
            build(:application_instance,
              health: Health.passing(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, heartbeat: :critical, cluster: nil)
            )
          ]
        )

      assert {:error,
              [
                %{
                  message: "Instance #{inst_number} of SAP system {0} is not stopped",
                  metadata: [%{id: sap_system_id, label: sid, type: :sap_system}]
                }
              ]} ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "scs"
               })
    end

    test "should authorize operation if cluster is in maintenance" do
      %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(true)

      sap_system =
        build(:sap_system,
          application_instances:
            build_list(2, :application_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "all"
               })
    end

    test "should authorize operation if cluster is not in maintenance and the request is for application instances" do
      for instance_type <- ["abap", "j2ee"] do
        %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
          cluster = build_cluster_with_maintenance(false)

        sap_system =
          build(:sap_system,
            application_instances:
              build_list(2, :application_instance,
                sid: sid,
                instance_number: instance_number,
                host: build(:host, heartbeat: :passing, cluster: cluster)
              )
          )

        assert :ok ==
                 SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                   instance_type: instance_type
                 })
      end
    end

    test "should authorize operation if the request is not for the message server" do
      sap_system =
        build(:sap_system,
          application_instances: [
            build(:application_instance,
              health: Health.passing(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation if the message server is stopped" do
      sap_system =
        build(:sap_system,
          application_instances: [
            build(:application_instance,
              health: Health.unknown(),
              features: "MESSAGESERVER|ENQUE",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "abap"
               })
    end

    test "should authorize operation in a J2EE system if other instances are stopped and the request is for the message server" do
      sap_system =
        build(:sap_system,
          application_instances: [
            build(:application_instance,
              health: Health.unknown(),
              features: "J2EE|IGS",
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:application_instance,
              health: Health.passing(),
              features: "GATEWAY|MESSAGESERVER|ENQUE",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               SapSystemPolicy.authorize_operation(:sap_system_stop, sap_system, %{
                 instance_type: "scs"
               })
    end
  end

  defp build_cluster_with_maintenance(maintenance_mode) do
    [%{id: resource_id, sid: sid}] =
      resources =
      build_list(1, :cluster_resource,
        type: "ocf::heartbeat:SAPInstance",
        managed: not maintenance_mode
      )

    clustered_sap_instances =
      build_list(1, :clustered_sap_instance, sid: sid, resource_id: resource_id)

    cluster_details =
      build(:ascs_ers_cluster_details,
        maintenance_mode: maintenance_mode,
        sap_systems: [],
        resources: resources
      )

    build(:cluster, sap_instances: clustered_sap_instances, details: cluster_details)
  end
end
