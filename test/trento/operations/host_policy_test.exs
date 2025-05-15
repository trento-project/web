defmodule Trento.Operations.HostPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Operations.HostPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    host = build(:host)

    assert {:error, ["Unknown operation"]} == HostPolicy.authorize_operation(:unknown, host, %{})
  end

  describe "Saptune operations" do
    for operation <- [:saptune_solution_apply, :saptune_solution_change] do
      @saptune_operation operation

      test "should forbid operation '#{operation}' if an application instance is not stopped" do
        application_instances = [
          build(:application_instance, health: Health.unknown()),
          %{sid: sid, instance_number: instance_number} =
            build(:application_instance, health: Health.passing())
        ]

        database_instancess = build_list(2, :database_instance, health: Health.unknown())

        %{name: cluster_name} = cluster = build(:cluster, details: build(:hana_cluster_details))

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instancess,
            cluster: cluster
          )

        assert {:error,
                [
                  "Cluster #{cluster_name} operating this host is not in maintenance mode",
                  "Instance #{instance_number} of SAP system #{sid} is not stopped"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if an database instance is not stopped" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())

        database_instancess = [
          build(:database_instance, health: Health.unknown()),
          %{sid: sid, instance_number: instance_number} =
            build(:database_instance, health: Health.passing())
        ]

        %{name: cluster_name} = cluster = build(:cluster, details: build(:hana_cluster_details))

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instancess,
            cluster: cluster
          )

        assert {:error,
                [
                  "Cluster #{cluster_name} operating this host is not in maintenance mode",
                  "Instance #{instance_number} of HANA database #{sid} is not stopped"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should forbid operation '#{operation}' if an application and database instances are not stopped" do
        application_instances = [
          build(:application_instance, health: Health.unknown()),
          %{sid: app_sid, instance_number: app_instance_number} =
            build(:application_instance, health: Health.passing())
        ]

        database_instancess = [
          build(:database_instance, health: Health.unknown()),
          %{sid: db_sid, instance_number: db_instance_number} =
            build(:database_instance, health: Health.passing())
        ]

        %{name: cluster_name} = cluster = build(:cluster, details: build(:hana_cluster_details))

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instancess,
            cluster: cluster
          )

        assert {:error,
                [
                  "Cluster #{cluster_name} operating this host is not in maintenance mode",
                  "Instance #{app_instance_number} of SAP system #{app_sid} is not stopped",
                  "Instance #{db_instance_number} of HANA database #{db_sid} is not stopped"
                ]} == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if there is not any SAP instance running" do
        host =
          build(:host,
            application_instances: [],
            database_instances: [],
            cluster: nil
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if all instances are stopped and the host is not clustered" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())
        database_instancess = build_list(2, :database_instance, health: Health.unknown())

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instancess,
            cluster: nil
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if all instances are stopped and cluster is in maintenance" do
        application_instances = build_list(2, :application_instance, health: Health.unknown())
        database_instancess = build_list(2, :database_instance, health: Health.unknown())
        cluster = build(:cluster, details: build(:hana_cluster_details, maintenance_mode: true))

        host =
          build(:host,
            application_instances: application_instances,
            database_instances: database_instancess,
            cluster: cluster
          )

        assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
      end

      test "should authorize operation '#{operation}' if all instances are stopped and HANA resources are not managed" do
        scenarios = [
          %{cluster_resource_type: "ocf::suse:SAPHana"},
          %{cluster_resource_type: "ocf::suse:SAPHanaController"}
        ]

        database_instancess = build_list(2, :database_instance, health: Health.unknown())

        for %{cluster_resource_type: cluster_resource_type} <- scenarios do
          parent = build(:cluster_resource_parent, managed: false)

          cluster_resource =
            build(:cluster_resource, type: cluster_resource_type, managed: true, parent: parent)

          nodes = build_list(1, :hana_cluster_node, resources: [cluster_resource])
          cluster_details = build(:hana_cluster_details, maintenance_mode: false, nodes: nodes)
          cluster = build(:cluster, details: cluster_details)

          host =
            build(:host,
              application_instances: [],
              database_instances: database_instancess,
              cluster: cluster
            )

          assert :ok == HostPolicy.authorize_operation(@saptune_operation, host, %{})
        end
      end
    end
  end
end
