defmodule Trento.Operations.ClusterPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  alias Trento.Operations.ClusterPolicy

  import Trento.Factory

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus
  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  test "should forbid unknown operation" do
    cluster = build(:cluster)

    assert {:error, ["Unknown operation"]} ==
             ClusterPolicy.authorize_operation(:unknown, cluster, %{})
  end

  describe "maintenance" do
    test "should authorize operation depending on the cluster maintenance mode" do
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

        assert result ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should authorize operation depending on the given cluster resource managed state" do
      cluster_name = Faker.StarWars.character()
      cluster_resource_id = UUID.uuid4()

      scenarios = [
        %{
          managed: true,
          result:
            {:error,
             [
               "Cluster #{cluster_name} or resource #{cluster_resource_id} operating this host are not in maintenance mode"
             ]}
        },
        %{managed: false, result: :ok}
      ]

      for %{managed: managed, result: result} <- scenarios do
        cluster_resource = build(:cluster_resource, id: cluster_resource_id, managed: managed)

        cluster_details =
          build(:hana_cluster_details, maintenance_mode: false, resources: [cluster_resource])

        cluster = build(:cluster, name: cluster_name, details: cluster_details)

        assert result ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: cluster_resource_id
                 })
      end
    end
  end

  describe "cluster_maintenance_change" do
    test "should authorize cluster_maintenance_change operation if at least one host is online" do
      cluster =
        build(:cluster,
          hosts: [
            build(:host, cluster_host_status: ClusterHostStatus.offline()),
            build(:host, cluster_host_status: ClusterHostStatus.online())
          ]
        )

      assert :ok == ClusterPolicy.authorize_operation(:cluster_maintenance_change, cluster, %{})
    end

    test "should forbid cluster_maintenance_change operation if all hosts are offline" do
      %{name: cluster_name} =
        cluster =
        build(:cluster,
          hosts: build_list(2, :host, cluster_host_status: ClusterHostStatus.offline())
        )

      assert {:error, ["Cluster #{cluster_name} does not have any online node"]} ==
               ClusterPolicy.authorize_operation(:cluster_maintenance_change, cluster, %{})
    end
  end

  describe "enable/disable pacemaker" do
    test "should authorize enable/disable pacemaker operation" do
      authorized_scenarios = [
        %{
          operation: :pacemaker_enable,
          host_units: [
            [name: "pacemaker.service", unit_file_state: "disabled"]
          ]
        },
        %{
          operation: :pacemaker_disable,
          host_units: [
            [name: "pacemaker.service", unit_file_state: "enabled"]
          ]
        }
      ]

      for %{operation: operation, host_units: host_units} <- authorized_scenarios do
        host_id = Faker.UUID.v4()

        cluster =
          build(:cluster,
            hosts: [
              build(:host,
                id: host_id,
                systemd_units: Enum.map(host_units, &build(:host_systemd_unit, &1))
              )
            ]
          )

        assert :ok == ClusterPolicy.authorize_operation(operation, cluster, %{host_id: host_id})
      end
    end

    test "should not authorize enable/disable pacemaker operation" do
      unauthorized_scenarios = [
        %{
          operation: :pacemaker_enable,
          host_units: [
            [name: "pacemaker.service", unit_file_state: "enabled"]
          ],
          expected_error: fn %{hostname: hostname} ->
            "Pacemaker service on host #{hostname} is already enabled"
          end
        },
        %{
          operation: :pacemaker_disable,
          host_units: [
            [name: "pacemaker.service", unit_file_state: "disabled"]
          ],
          expected_error: fn %{hostname: hostname} ->
            "Pacemaker service on host #{hostname} is already disabled"
          end
        },
        %{
          operation: :pacemaker_enable,
          host_units: [
            [name: "pacemaker.service", unit_file_state: "unrecognized_state"]
          ],
          expected_error: fn %{hostname: hostname} ->
            "Pacemaker service unit state is unrecognized on host #{hostname}"
          end
        },
        %{
          operation: :pacemaker_disable,
          host_units: [
            [name: "pacemaker.service", unit_file_state: "unrecognized_state"]
          ],
          expected_error: fn %{hostname: hostname} ->
            "Pacemaker service unit state is unrecognized on host #{hostname}"
          end
        }
      ]

      for %{
            operation: operation,
            host_units: host_units,
            expected_error: expected_error_fn
          } <- unauthorized_scenarios do
        host_id = Faker.UUID.v4()

        host =
          build(:host,
            id: host_id,
            systemd_units: Enum.map(host_units, &build(:host_systemd_unit, &1))
          )

        cluster = build(:cluster, hosts: [host])

        expected_error = expected_error_fn.(host)

        assert {:error, [^expected_error]} =
                 ClusterPolicy.authorize_operation(operation, cluster, %{host_id: host_id})
      end
    end
  end

  describe "cluster host start/stop" do
    test "should authorize cluster_host_start operation" do
      cluster =
        build(:cluster,
          hosts: [
            build(:host, cluster_host_status: ClusterHostStatus.online())
          ]
        )

      assert :ok == ClusterPolicy.authorize_operation(:cluster_host_start, cluster, %{})
    end

    test "should authorize cluster_host_stop operation" do
      cluster =
        build(:cluster,
          hosts: [
            build(:host, cluster_host_status: ClusterHostStatus.offline())
          ]
        )

      assert :ok == ClusterPolicy.authorize_operation(:cluster_host_stop, cluster, %{})
    end

    test "should not authorize cluster_host_stop operation on primary node if secondary nodes are online" do
      primary_node_id = Faker.UUID.v4()

      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_up(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "node1", hana_status: "Primary"),
                build(:hana_cluster_node, name: "node2", hana_status: "Secondary")
              ]
            ),
          hosts: [
            build(:host,
              id: primary_node_id,
              hostname: "node1",
              cluster_host_status: ClusterHostStatus.online()
            ),
            build(:host, hostname: "node2", cluster_host_status: ClusterHostStatus.online())
          ]
        )

      assert {:error, [error_message]} =
               ClusterPolicy.authorize_operation(:cluster_host_stop, cluster, %{
                 host_id: primary_node_id
               })

      assert error_message ==
               "Cannot stop the primary node node1 because some secondary nodes are still online"
    end

    test "should authorize cluster_host_stop operation on primary node if secondary nodes are offline" do
      primary_node_id = Faker.UUID.v4()

      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_up(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "node1", hana_status: "Primary"),
                build(:hana_cluster_node, name: "node2", hana_status: "Secondary")
              ]
            ),
          hosts: [
            build(:host,
              id: primary_node_id,
              hostname: "node1",
              cluster_host_status: ClusterHostStatus.online()
            ),
            build(:host, hostname: "node2", cluster_host_status: ClusterHostStatus.offline())
          ]
        )

      assert :ok ==
               ClusterPolicy.authorize_operation(:cluster_host_stop, cluster, %{
                 host_id: primary_node_id
               })
    end

    test "should not authorize cluster_host_start operation on secondary node if primary node is offline" do
      secondary_node_id = Faker.UUID.v4()

      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_up(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "node1", hana_status: "Primary"),
                build(:hana_cluster_node, name: "node2", hana_status: "Secondary")
              ]
            ),
          hosts: [
            build(:host, hostname: "node1", cluster_host_status: ClusterHostStatus.offline()),
            build(:host,
              id: secondary_node_id,
              hostname: "node2",
              cluster_host_status: ClusterHostStatus.offline()
            )
          ]
        )

      assert {:error, [error_message]} =
               ClusterPolicy.authorize_operation(:cluster_host_start, cluster, %{
                 host_id: secondary_node_id
               })

      assert error_message ==
               "Cannot start secondary node node2 before starting primary node node1"
    end

    test "should authorize cluster_host_start operation on secondary node if primary node is online" do
      secondary_node_id = Faker.UUID.v4()

      cluster =
        build(:cluster,
          type: ClusterType.hana_scale_up(),
          details:
            build(:hana_cluster_details,
              nodes: [
                build(:hana_cluster_node, name: "node1", hana_status: "Primary"),
                build(:hana_cluster_node, name: "node2", hana_status: "Secondary")
              ]
            ),
          hosts: [
            build(:host, hostname: "node1", cluster_host_status: ClusterHostStatus.online()),
            build(:host,
              id: secondary_node_id,
              hostname: "node2",
              cluster_host_status: ClusterHostStatus.offline()
            )
          ]
        )

      assert :ok ==
               ClusterPolicy.authorize_operation(:cluster_host_start, cluster, %{
                 host_id: secondary_node_id
               })
    end
  end
end
