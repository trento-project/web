defmodule Trento.Operations.HostPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterType, as: ClusterType

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

        clustered_sap_instances =
          build_list(1, :clustered_sap_instance, sid: sid, instance_number: instance_number)

        database_instances = build_list(2, :database_instance, health: Health.unknown())

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
                  "Instance #{instance_number} of SAP system #{sid} is not stopped",
                  "Cluster #{cluster_name} operating this host is not in maintenance mode"
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

        clustered_sap_instances =
          build_list(1, :clustered_sap_instance,
            sid: app_sid,
            instance_number: app_instance_number
          )

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
                  "Instance #{app_instance_number} of SAP system #{app_sid} is not stopped",
                  "Cluster #{cluster_name} operating this host is not in maintenance mode",
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
            instance_number: instance_number
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
          cluster_id: nil
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if pacemaker service is enabled" do
      cluster = build(:cluster, name: "hana-cluster", type: ClusterType.hana_scale_up())

      host =
        build(:host,
          cluster: cluster,
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "enabled")
          ]
        )

      {:error, _} = HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should authorize host reboot if cluster is hana scale up and all nodes are stopped" do
      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_up(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "node1"),
                build(:hana_cluster_node, name: "node2")
              ]
            ),
          hosts: [
            build(:host, hostname: "host1", cluster_host_status: "offline"),
            build(:host, hostname: "host2", cluster_host_status: "offline")
          ]
        )

      host =
        build(:host,
          hostname: "host1",
          cluster: cluster,
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          cluster_id: cluster.id
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if cluster is hana scale up and not all nodes are stopped" do
      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_up(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "node1"),
                build(:hana_cluster_node, name: "node2")
              ]
            ),
          hosts: [
            build(:host, hostname: "host1", cluster_host_status: "online"),
            build(:host, hostname: "host2", cluster_host_status: "offline")
          ]
        )

      host =
        build(:host,
          hostname: "host1",
          cluster: cluster,
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          cluster_id: cluster.id
        )

      {:error, _} = HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should authorize host reboot if cluster is hana scale out and all secondary nodes are stopped" do
      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_out(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "host1", hana_status: "Primary"),
                build(:hana_cluster_node, name: "host2", hana_status: "Secondary"),
                build(:hana_cluster_node, name: "host3", hana_status: "Secondary")
              ]
            ),
          hosts: [
            build(:host, hostname: "host2", cluster_host_status: "offline"),
            build(:host, hostname: "host3", cluster_host_status: "offline")
          ]
        )

      host =
        build(:host,
          cluster: cluster,
          hostname: "host1",
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          cluster_id: cluster.id
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if cluster is hana scale out and not all secondary nodes are stopped" do
      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_out(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "host1", hana_status: "Primary"),
                build(:hana_cluster_node, name: "host2", hana_status: "Secondary"),
                build(:hana_cluster_node, name: "host3", hana_status: "Secondary")
              ]
            ),
          hosts: [
            build(:host, hostname: "host2", cluster_host_status: "online"),
            build(:host, hostname: "host3", cluster_host_status: "offline")
          ]
        )

      host =
        build(:host,
          cluster: cluster,
          hostname: "host1",
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          cluster_id: cluster.id
        )

      {:error, _} = HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should authorize host reboot if cluster is ASCS/ERS and all nodes are stopped" do
      cluster =
        build(:cluster,
          type: ClusterType.ascs_ers(),
          details:
            build(:ascs_ers_cluster_details,
              sap_systems:
                build(:ascs_ers_cluster_sap_system,
                  nodes: [
                    build(:ascs_ers_cluster_node, name: "host1"),
                    build(:ascs_ers_cluster_node, name: "host2")
                  ]
                )
            ),
          hosts: [
            build(:host, hostname: "host1", cluster_host_status: "offline"),
            build(:host, hostname: "host2", cluster_host_status: "offline")
          ]
        )

      host =
        build(:host,
          cluster: cluster,
          hostname: "host1",
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          cluster_id: cluster.id
        )

      assert :ok == HostPolicy.authorize_operation(:reboot, host, %{})
    end

    test "should forbid host reboot if cluster is ASCS/ERS and not all nodes are stopped" do
      cluster =
        build(:cluster,
          type: ClusterType.ascs_ers(),
          details:
            build(:ascs_ers_cluster_details,
              sap_systems:
                build(:ascs_ers_cluster_sap_system,
                  nodes: [
                    build(:ascs_ers_cluster_node, name: "host1"),
                    build(:ascs_ers_cluster_node, name: "host2")
                  ]
                )
            ),
          hosts: [
            build(:host, hostname: "host1", cluster_host_status: "online"),
            build(:host, hostname: "host2", cluster_host_status: "offline")
          ]
        )

      host =
        build(:host,
          cluster: cluster,
          hostname: "host1",
          systemd_units: [
            build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
          ],
          cluster_id: cluster.id
        )

      {:error, _} = HostPolicy.authorize_operation(:reboot, host, %{})
    end
  end
end
