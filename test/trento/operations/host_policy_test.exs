defmodule Trento.Operations.HostPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  alias Trento.Operations.HostPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    host = build(:host)

    assert {:error, ["Unknown operation"]} == HostPolicy.authorize_operation(:unknown, host, %{})
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
          %{sid: sid, instance_number: instance_number} =
            build(:application_instance, health: Health.passing())
        ]

        [%{id: resource_id}] =
          resources =
          build_list(1, :cluster_resource,
            type: "ocf::heartbeat:SAPInstance",
            managed: true,
            sid: sid
          )

        clustered_sap_instances =
          build_list(1, :clustered_sap_instance,
            sid: sid,
            instance_number: instance_number,
            resource_id: resource_id
          )

        database_instances = build_list(2, :database_instance, health: Health.unknown())

        %{name: cluster_name} =
          cluster =
          build(:cluster,
            sap_instances: clustered_sap_instances,
            details: build(:ascs_ers_cluster_details, resources: resources)
          )

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: cluster,
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  "Instance #{instance_number} of SAP system #{sid} is not stopped",
                  "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if an database instance is not stopped. Scenario: #{name}" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())

        database_instances = [
          build(:database_instance, health: Health.unknown()),
          %{sid: sid, instance_number: instance_number} =
            build(:database_instance, health: Health.passing())
        ]

        clustered_sap_instances =
          build_list(1, :clustered_sap_instance, sid: sid, instance_number: instance_number)

        %{name: cluster_name} =
          cluster =
          build(:cluster,
            sap_instances: clustered_sap_instances,
            details: build(:hana_cluster_details)
          )

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: cluster,
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  "Instance #{instance_number} of HANA database #{sid} is not stopped",
                  "Cluster #{cluster_name} operating this host is not in maintenance mode"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if an application and database instances are not stopped. Scenario: #{name}" do
        application_instances = [
          build(:application_instance, health: Health.unknown()),
          %{sid: app_sid, instance_number: app_instance_number} =
            build(:application_instance, health: Health.passing())
        ]

        database_instances = [
          build(:database_instance, health: Health.unknown()),
          %{sid: db_sid, instance_number: db_instance_number} =
            build(:database_instance, health: Health.passing())
        ]

        [%{id: resource_id}] =
          resources =
          build_list(1, :cluster_resource,
            type: "ocf::heartbeat:SAPInstance",
            managed: true,
            sid: app_sid
          )

        clustered_sap_instances =
          build_list(1, :clustered_sap_instance,
            sid: app_sid,
            instance_number: app_instance_number,
            resource_id: resource_id
          )

        %{name: cluster_name} =
          cluster =
          build(:cluster,
            sap_instances: clustered_sap_instances,
            details: build(:hana_cluster_details, resources: resources)
          )

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: cluster,
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  "Instance #{app_instance_number} of SAP system #{app_sid} is not stopped",
                  "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode",
                  "Instance #{db_instance_number} of HANA database #{db_sid} is not stopped"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if an application instance cluster resource is managed. Scenario: #{name}" do
        application_instances = [
          %{sid: sid, instance_number: instance_number} =
            build(:application_instance, health: Health.unknown())
        ]

        database_instances = build_list(2, :database_instance, health: Health.unknown())

        resources =
          [%{id: resource_id}] =
          build_list(1, :cluster_resource,
            type: "ocf::heartbeat:SAPInstance",
            managed: true,
            sid: sid
          )

        cluster_details =
          build(:ascs_ers_cluster_details, maintenance_mode: false, resources: resources)

        clustered_sap_instances =
          build_list(1, :clustered_sap_instance,
            sid: sid,
            instance_number: instance_number,
            resource_id: resource_id
          )

        %{name: cluster_name} =
          cluster =
          build(:cluster,
            type: :ascs_ers,
            sap_instances: clustered_sap_instances,
            details: cluster_details
          )

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: cluster,
            saptune_status: @saptune_status
          )

        assert {:error,
                [
                  "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if a database instance cluster resource is managed. Scenario: #{name}" do
        scenarios = [
          %{cluster_resource_type: "ocf::suse:SAPHana"},
          %{cluster_resource_type: "ocf::suse:SAPHanaController"}
        ]

        [%{sid: sid, instance_number: instance_number}] =
          clustered_sap_instances =
          build_list(1, :clustered_sap_instance)

        database_instances =
          build_list(2, :database_instance,
            health: Health.unknown(),
            sid: sid,
            instance_number: instance_number
          )

        application_instances = build_list(2, :application_instance, health: Health.unknown())

        for %{cluster_resource_type: cluster_resource_type} <- scenarios do
          %{id: resource_id} = parent = build(:cluster_resource_parent, managed: true)

          cluster_resource =
            build(:cluster_resource, type: cluster_resource_type, parent: parent)

          cluster_details =
            build(:hana_cluster_details, maintenance_mode: false, resources: [cluster_resource])

          %{name: cluster_name} =
            cluster =
            build(:cluster, sap_instances: clustered_sap_instances, details: cluster_details)

          host =
            build(:host,
              application_instances: application_instances,
              database_instances: database_instances,
              cluster: cluster,
              saptune_status: @saptune_status
            )

          assert {:error,
                  [
                    "Cluster #{cluster_name} or resource #{resource_id} operating this host are not in maintenance mode"
                  ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
        end
      end

      test "should authorize operation '#{operation}' if there is not any SAP instance running. Scenario: #{name}" do
        host =
          build(:host,
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
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: nil,
            saptune_status: @saptune_status
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if all instances are stopped and cluster is in maintenance. Scenario: #{name}" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())
        database_instances = build_list(2, :database_instance, health: Health.unknown())
        cluster = build(:cluster, details: build(:hana_cluster_details, maintenance_mode: true))

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instances,
            cluster: cluster,
            saptune_status: @saptune_status
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end
    end

    test "should forbid applying a saptune solution when there is an already applied one" do
      host =
        build(:host,
          application_instances: [],
          database_instances: [],
          cluster: nil,
          saptune_status: build(:saptune_status)
        )

      assert {:error,
              [
                "Cannot apply the requested solution because there is an already applied on this host"
              ]} == HostPolicy.authorize_operation(:saptune_solution_apply, host, %{})
    end

    test "should forbid changing saptune solution when there is not an already applied one" do
      for saptune_status <- [
            nil,
            build(:saptune_status, applied_solution: nil)
          ] do
        host =
          build(:host,
            application_instances: [],
            database_instances: [],
            cluster: nil,
            saptune_status: saptune_status
          )

        assert {:error,
                [
                  "Cannot change the requested solution because there is no currently applied one on this host"
                ]} == HostPolicy.authorize_operation(:saptune_solution_change, host, %{})
      end
    end
  end

  describe "host reboot operation" do
    test "should authorize host reboot if host is not part of a cluster" do
      host =
        build(:host,
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
          cluster: nil,
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
          hostname: "host1",
          cluster_host_status: ClusterHostStatus.online(),
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          application_instances: [],
          database_instances: []
        )

      {:error, ["Cluster is running in the host"]} =
        HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should authorize host reboot if all application and database instances are stopped" do
      host =
        build(:host,
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
      host =
        build(:host,
          cluster: nil,
          cluster_id: nil,
          application_instances: [
            build(:application_instance, health: Health.unknown()),
            build(:application_instance, health: Health.passing())
          ],
          database_instances: [
            build(:database_instance, health: Health.unknown()),
            build(:database_instance, health: Health.passing())
          ]
        )

      {:error,
       [
         "There are running application instances on the host",
         "There are running database instances on the host"
       ]} =
        HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if not all database instances are stopped" do
      host =
        build(:host,
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
