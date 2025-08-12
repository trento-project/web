defmodule Trento.Operations.DatabasePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Operations.DatabasePolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    database = build(:database)

    assert {:error, ["Unknown operation"]} ==
             DatabasePolicy.authorize_operation(:unknown, database, %{})
  end

  describe "database_start" do
    test "should forbid operation if the database cluster is not in maintenance" do
      %{name: cluster_name, sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(false)

      database =
        build(:database,
          database_instances:
            build_list(2, :database_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
        )

      assert {:error, ["Cluster #{cluster_name} operating this host is not in maintenance mode"]} ==
               DatabasePolicy.authorize_operation(:database_start, database, %{})
    end

    test "should forbid operation in secondary site if primary site is not started" do
      %{sid: sid} =
        database =
        build(:database,
          database_instances: [
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert {:error, ["Primary site Site1 of database #{sid} is not started"]} ==
               DatabasePolicy.authorize_operation(:database_start, database, %{site: "Site2"})
    end

    test "should authorize operation if cluster is in maintenance and system replication is not enabled" do
      %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(true)

      database =
        build(:database,
          database_instances: [
            build(:database_instance,
              system_replication: nil,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_start, database, %{})
    end

    test "should authorize operation if the request is for the primary site" do
      database =
        build(:database,
          database_instances: [
            build(:database_instance,
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_start, database, %{site: "Site1"})
    end

    test "should authorize operation if the request is for the secondary site and primary is started" do
      database =
        build(:database,
          database_instances: [
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_start, database, %{site: "Site2"})
    end
  end

  describe "database_stop" do
    test "should forbid operation if the database cluster is not in maintenance" do
      %{name: cluster_name, sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(false)

      database =
        build(:database,
          sap_systems: [],
          database_instances:
            build_list(2, :database_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
        )

      assert {:error, ["Cluster #{cluster_name} operating this host is not in maintenance mode"]} ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{})
    end

    test "should forbid operation if the request is for the primary site and secondary sites are not stopped" do
      %{sid: sid} =
        database =
        build(:database,
          sap_systems: [],
          database_instances: [
            build(:database_instance,
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert {:error, ["Secondary sites of database #{sid} are not stopped"]} ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: "Site1"})
    end

    test "should forbid operation if the request is for the primary site and attached application instances are not stopped" do
      database =
        build(:database,
          sap_systems: [
            %{
              application_instances:
                [
                  %{sid: sid1, instance_number: inst_number1},
                  %{sid: sid2, instance_number: inst_number2}
                ] =
                  build_list(2, :application_instance,
                    health: Health.passing(),
                    features: "ABAP|GATEWAY|ICMAN|IGS"
                  )
            }
          ],
          database_instances: [
            build(:database_instance,
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Secondary",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert {:error,
              [
                "Instance #{inst_number1} of SAP system #{sid1} is not stopped",
                "Instance #{inst_number2} of SAP system #{sid2} is not stopped"
              ]} ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: "Site1"})
    end

    test "should authorize operation if cluster is in maintenance and system replication is not enabled" do
      %{sap_instances: [%{sid: sid, instance_number: instance_number}]} =
        cluster = build_cluster_with_maintenance(true)

      database =
        build(:database,
          sap_systems: [],
          database_instances: [
            build(:database_instance,
              system_replication: nil,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, cluster: cluster)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{})
    end

    test "should authorize operation if the request is for the secondary site" do
      database =
        build(:database,
          sap_systems: [],
          database_instances: [
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: "Site2"})
    end

    test "should authorize operation if attached application instances are stopped" do
      database =
        build(:database,
          sap_systems: [
            %{
              application_instances:
                build_list(2, :application_instance,
                  health: Health.unknown(),
                  features: "ABAP|GATEWAY|ICMAN|IGS"
                )
            },
            %{
              application_instances:
                build_list(2, :application_instance,
                  health: Health.unknown(),
                  features: "J2EE|GATEWAY|ICMAN|IGS"
                )
            }
          ],
          database_instances: build_list(2, :database_instance, host: build(:host, cluster: nil))
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{})
    end

    test "should forbid operation if the request is for the secondary site and attached application instances are not stopped" do
      database =
        build(:database,
          sap_systems: [
            %{
              application_instances:
                build_list(2, :application_instance,
                  health: Health.passing(),
                  features: "ABAP|GATEWAY|ICMAN|IGS"
                )
            }
          ],
          database_instances: [
            build(:database_instance,
              system_replication: "Primary",
              host: build(:host, cluster: nil)
            ),
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: "Site2"})
    end
  end

  defp build_cluster_with_maintenance(maintenance_mode) do
    clustered_sap_instances =
      build_list(1, :clustered_sap_instance)

    cluster_details =
      build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

    build(:cluster, sap_instances: clustered_sap_instances, details: cluster_details)
  end
end
