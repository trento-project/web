defmodule Trento.Operations.HostPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus
  require Trento.Operations.Enums.HostOperations, as: HostOperations

  alias Trento.Operations.HostPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    host = build(:host, heartbeat: :passing)

    assert {:error, [%{message: "Unknown operation", metadata: []}]} ==
             HostPolicy.authorize_operation(:unknown, host, %{})
  end

  test "should forbid operation if the host heartbeat is not passing" do
    host = build(:host, heartbeat: :critical)

    for operation <- HostOperations.values() do
      assert {:error,
              [%{message: "Trento agent is not currently running in the host", metadata: []}]} ==
               HostPolicy.authorize_operation(operation, host, %{})
    end
  end

  describe "Saptune operations" do
    scenarios = [
      %{
        name: "applying solution when there is no saptune status",
        operation: :saptune_solution_apply,
        saptune_status: nil
      },
      %{
        name: "applying solution when there is no applied solution in saptune status",
        operation: :saptune_solution_apply,
        saptune_status: build(:saptune_status, applied_solution: nil)
      },
      %{
        name: "changing solution when there is an already applied solution",
        operation: :saptune_solution_change,
        saptune_status: build(:saptune_status)
      }
    ]

    for %{name: name, operation: operation, saptune_status: saptune_status} <- scenarios do
      @saptune_operation operation
      @saptune_status saptune_status

      test "should forbid operation '#{operation}' if an application instance is not stopped. Scenario: #{name}" do
        application_instances = [
          build(:application_instance, health: Health.unknown()),
          %{sap_system_id: sap_system_id, sid: sid, instance_number: instance_number} =
            build(:application_instance, health: Health.passing())
        ]

        database_instances = build_list(2, :database_instance, health: Health.unknown())

        host =
          build(:host,
            heartbeat: :passing,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: build(:cluster),
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  %{
                    message: "Instance #{instance_number} of SAP system {0} is not stopped",
                    metadata: [%{id: sap_system_id, label: sid, type: :sap_system}]
                  }
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if a database instance is not stopped. Scenario: #{name}" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())

        database_instances = [
          build(:database_instance, health: Health.unknown()),
          %{database_id: database_id, sid: sid, instance_number: instance_number} =
            build(:database_instance, health: Health.passing())
        ]

        host =
          build(:host,
            heartbeat: :passing,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: build(:cluster),
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  %{
                    message: "Instance #{instance_number} of HANA database {0} is not stopped",
                    metadata: [%{id: database_id, label: sid, type: :database}]
                  }
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if an application and database instances are not stopped. Scenario: #{name}" do
        application_instances = [
          build(:application_instance, health: Health.unknown()),
          %{sap_system_id: sap_system_id, sid: app_sid, instance_number: app_instance_number} =
            build(:application_instance, health: Health.passing())
        ]

        database_instances = [
          build(:database_instance, health: Health.unknown()),
          %{database_id: database_id, sid: db_sid, instance_number: db_instance_number} =
            build(:database_instance, health: Health.passing())
        ]

        host =
          build(:host,
            heartbeat: :passing,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: build(:cluster),
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  %{
                    message: "Instance #{app_instance_number} of SAP system {0} is not stopped",
                    metadata: [%{id: sap_system_id, label: app_sid, type: :sap_system}]
                  },
                  %{
                    message: "Instance #{db_instance_number} of HANA database {0} is not stopped",
                    metadata: [%{id: database_id, label: db_sid, type: :database}]
                  }
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if there is not any SAP instance running. Scenario: #{name}" do
        host =
          build(:host,
            heartbeat: :passing,
            application_instances: [],
            database_instances: [],
            cluster: nil,
            saptune_status: @saptune_status
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if all instances are stopped and the host is not clustered. Scenario: #{name}" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())
        database_instances = build_list(2, :database_instance, health: Health.unknown())

        host =
          build(:host,
            heartbeat: :passing,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: nil,
            saptune_status: @saptune_status
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if all instances are stopped. Scenario: #{name}" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())
        database_instances = build_list(2, :database_instance, health: Health.unknown())

        maintenance_cluster =
          build(:cluster, details: build(:hana_cluster_details, maintenance_mode: true))

        non_maintenance_cluster =
          build(:cluster, details: build(:hana_cluster_details, maintenance_mode: false))

        hosts = [
          build(:host,
            heartbeat: :passing,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: maintenance_cluster,
            saptune_status: @saptune_status
          ),
          build(:host,
            heartbeat: :passing,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: non_maintenance_cluster,
            saptune_status: @saptune_status
          )
        ]

        for host <- hosts do
          assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
        end
      end
    end

    test "should forbid applying a saptune solution when there is an already applied one" do
      host =
        build(:host,
          heartbeat: :passing,
          application_instances: [],
          database_instances: [],
          cluster: nil,
          saptune_status: build(:saptune_status)
        )

      assert {:error,
              [
                %{
                  message:
                    "Cannot apply the requested solution because there is an already applied one on this host",
                  metadata: []
                }
              ]} == HostPolicy.authorize_operation(:saptune_solution_apply, host, %{})
    end

    test "should forbid changing saptune solution when there is not an already applied one" do
      for saptune_status <- [
            nil,
            build(:saptune_status, applied_solution: nil)
          ] do
        host =
          build(:host,
            heartbeat: :passing,
            application_instances: [],
            database_instances: [],
            cluster: nil,
            saptune_status: saptune_status
          )

        assert {:error,
                [
                  %{
                    message:
                      "Cannot change the requested solution because there is no currently applied one on this host",
                    metadata: []
                  }
                ]} == HostPolicy.authorize_operation(:saptune_solution_change, host, %{})
      end
    end
  end

  describe "host reboot operation" do
    test "should authorize host reboot if host is not part of a cluster" do
      host =
        build(:host,
          heartbeat: :passing,
          cluster: nil,
          cluster_id: nil,
          application_instances: [],
          database_instances: []
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if pacemaker service is enabled" do
      host =
        build(:host,
          heartbeat: :passing,
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "enabled")
          ],
          application_instances: [],
          database_instances: []
        )

      {:error, _} = HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should authorize host reboot if the cluster is stopped/offline in the host" do
      host =
        build(:host,
          heartbeat: :passing,
          hostname: "host1",
          cluster_host_status: ClusterHostStatus.offline(),
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          application_instances: [],
          database_instances: []
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if the cluster is running/online in the host" do
      host =
        build(:host,
          heartbeat: :passing,
          hostname: "host1",
          cluster_host_status: ClusterHostStatus.online(),
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          application_instances: [],
          database_instances: []
        )

      {:error, [%{message: "Cluster is running in the host", metadata: []}]} =
        HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should authorize host reboot if all application and database instances are stopped" do
      host =
        build(:host,
          heartbeat: :passing,
          cluster: nil,
          cluster_id: nil,
          application_instances: [
            build(:application_instance, health: Health.unknown()),
            build(:application_instance, health: Health.unknown())
          ],
          database_instances: [
            build(:database_instance, health: Health.unknown()),
            build(:database_instance, health: Health.unknown())
          ]
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if not all application instances are stopped" do
      application_instances = [
        build(:application_instance, health: Health.unknown()),
        %{sap_system_id: sap_system_id, sid: sid1, instance_number: instance_number1} =
          build(:application_instance, health: Health.passing())
      ]

      database_instances = [
        build(:database_instance, health: Health.unknown()),
        %{database_id: database_id, sid: sid2, instance_number: instance_number2} =
          build(:database_instance, health: Health.passing())
      ]

      host =
        build(:host,
          heartbeat: :passing,
          cluster: nil,
          cluster_id: nil,
          application_instances: application_instances,
          database_instances: database_instances
        )

      assert {:error,
              [
                %{
                  message: "Instance #{instance_number1} of SAP system {0} is not stopped",
                  metadata: [%{id: sap_system_id, label: sid1, type: :sap_system}]
                },
                %{
                  message: "Instance #{instance_number2} of HANA database {0} is not stopped",
                  metadata: [%{id: database_id, label: sid2, type: :database}]
                }
              ]} == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if not all database instances are stopped" do
      host =
        build(:host,
          heartbeat: :passing,
          cluster: nil,
          cluster_id: nil,
          application_instances: [],
          database_instances: [
            build(:database_instance, health: Health.unknown()),
            build(:database_instance, health: Health.passing())
          ]
        )

      {:error, _} = HostPolicy.authorize_operation(:reboot, host, %{})
    end
  end
end
