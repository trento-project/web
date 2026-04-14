defmodule Trento.Operations.DatabasePolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  require Trento.Enums.Health, as: Health
  require Trento.Operations.Enums.DatabaseOperations, as: DatabaseOperations

  alias Trento.Operations.DatabasePolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    database = build(:database)

    assert {:error, [%{message: "Unknown operation", metadata: []}]} ==
             DatabasePolicy.authorize_operation(:unknown, database, %{})
  end

  test "should forbid operation if any of the hosts heartbeat per site where the database is running is not passing" do
    database =
      build(:database,
        database_instances: [
          build(:database_instance,
            system_replication_site: nil,
            host: build(:host, heartbeat: :critical)
          ),
          build(:database_instance,
            system_replication_site: "Site1",
            host: build(:host, heartbeat: :critical)
          ),
          build(:database_instance,
            system_replication_site: "Site1",
            host: build(:host, heartbeat: :critical)
          ),
          build(:database_instance,
            system_replication_site: "Site2",
            host: build(:host, heartbeat: :passing)
          ),
          build(:database_instance,
            system_replication_site: "Site2",
            host: build(:host, heartbeat: :critical)
          )
        ]
      )

    for operation <- DatabaseOperations.values() do
      assert {:error,
              [
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the database",
                  metadata: []
                },
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the database site Site1",
                  metadata: []
                }
              ]} ==
               DatabasePolicy.authorize_operation(operation, database, %{})
    end
  end

  test "should forbid operation if any of the hosts heartbeat where the database is running in a site is not passing" do
    site = "Site2"

    database =
      build(:database,
        database_instances: [
          build(:database_instance,
            system_replication_site: "Site1",
            system_replication: "Primary",
            host: build(:host, heartbeat: :critical)
          ),
          build(:database_instance,
            system_replication_site: site,
            system_replication: "Secondary",
            host: build(:host, heartbeat: :critical)
          ),
          build(:database_instance,
            system_replication_site: site,
            system_replication: "Secondary",
            host: build(:host, heartbeat: :critical)
          )
        ]
      )

    for operation <- DatabaseOperations.values() do
      assert {:error,
              [
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the database site #{site}",
                  metadata: []
                }
              ]} ==
               DatabasePolicy.authorize_operation(operation, database, %{site: site})
    end
  end

  test "should continue checking policies if at least one host heartbeat in the database is passing" do
    database =
      build(:database,
        sap_systems: [],
        database_instances: [
          build(:database_instance,
            system_replication_site: nil,
            host: build(:host, heartbeat: :passing, cluster: nil)
          ),
          build(:database_instance,
            system_replication_site: nil,
            host: build(:host, heartbeat: :critical, cluster: nil)
          )
        ]
      )

    for operation <- DatabaseOperations.values() do
      refute {:error,
              [
                %{
                  message:
                    "Trento agent is not currently running in any of the hosts in the database",
                  metadata: []
                }
              ]} ==
               DatabasePolicy.authorize_operation(operation, database, %{})
    end
  end

  describe "database_start" do
    test "should forbid operation if the database cluster is not in maintenance" do
      %{
        id: cluster_id,
        name: cluster_name,
        sap_instances: [%{sid: sid, instance_number: instance_number}]
      } =
        cluster = build_cluster_with_maintenance(false)

      database =
        build(:database,
          database_instances:
            build_list(2, :database_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
        )

      assert {:error,
              [
                %{
                  message: "Cluster {0} operating this host is not in maintenance mode",
                  metadata: [%{id: cluster_id, label: cluster_name, type: :cluster}]
                }
              ]} ==
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
              host: build(:host, heartbeat: :critical, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert {:error,
              [
                %{
                  message: "Primary site Site1 of database #{sid} is not started",
                  metadata: []
                }
              ]} ==
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
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_start, database, %{})
    end

    test "should authorize operation in full database if instances are stopped" do
      database =
        build(:database,
          database_instances: [
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_start, database, %{site: nil})

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
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
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
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_start, database, %{site: "Site2"})
    end
  end

  describe "database_stop" do
    test "should forbid operation if the database cluster is not in maintenance" do
      %{
        id: cluster_id,
        name: cluster_name,
        sap_instances: [%{sid: sid, instance_number: instance_number}]
      } =
        cluster = build_cluster_with_maintenance(false)

      database =
        build(:database,
          sap_systems: [],
          database_instances:
            build_list(2, :database_instance,
              sid: sid,
              instance_number: instance_number,
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
        )

      assert {:error,
              [
                %{
                  message: "Cluster {0} operating this host is not in maintenance mode",
                  metadata: [%{id: cluster_id, label: cluster_name, type: :cluster}]
                }
              ]} ==
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
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert {:error,
              [
                %{
                  message: "Secondary sites of database #{sid} are not stopped",
                  metadata: []
                }
              ]} ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: "Site1"})
    end

    test "should forbid operation if the request is for the primary site and attached application instances are not stopped" do
      database =
        build(:database,
          sap_systems: [
            %{
              application_instances:
                [
                  %{sap_system_id: sap_system_id1, sid: sid1, instance_number: inst_number1},
                  %{sap_system_id: sap_system_id2, sid: sid2, instance_number: inst_number2}
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
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Secondary",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert {:error,
              [
                %{
                  message: "Instance #{inst_number1} of SAP system {0} is not stopped",
                  metadata: [%{id: sap_system_id1, label: sid1, type: :sap_system}]
                },
                %{
                  message: "Instance #{inst_number2} of SAP system {0} is not stopped",
                  metadata: [%{id: sap_system_id2, label: sid2, type: :sap_system}]
                }
              ]} ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: "Site1"})
    end

    test "should forbid operation if the request is for a database without system replication and attached application instances are not stopped" do
      database =
        build(:database,
          sap_systems: [
            %{
              application_instances:
                [
                  %{sap_system_id: sap_system_id1, sid: sid1, instance_number: inst_number1},
                  %{sap_system_id: sap_system_id2, sid: sid2, instance_number: inst_number2}
                ] =
                  build_list(2, :application_instance,
                    health: Health.passing(),
                    features: "ABAP|GATEWAY|ICMAN|IGS"
                  )
            }
          ],
          database_instances: [
            build(:database_instance,
              system_replication: nil,
              system_replication_site: nil,
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert {:error,
              [
                %{
                  message: "Instance #{inst_number1} of SAP system {0} is not stopped",
                  metadata: [%{id: sap_system_id1, label: sid1, type: :sap_system}]
                },
                %{
                  message: "Instance #{inst_number2} of SAP system {0} is not stopped",
                  metadata: [%{id: sap_system_id2, label: sid2, type: :sap_system}]
                }
              ]} ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{})
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
              host: build(:host, heartbeat: :passing, cluster: cluster)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{})
    end

    test "should authorize operation in full database if instances are running" do
      database =
        build(:database,
          database_instances: [
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Primary",
              system_replication_site: "Site1",
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              health: Health.passing(),
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
          ]
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{site: nil})

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
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
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
          database_instances:
            build_list(2, :database_instance,
              host: build(:host, heartbeat: :passing, cluster: nil)
            )
        )

      assert :ok ==
               DatabasePolicy.authorize_operation(:database_stop, database, %{})
    end

    test "should authorize operation if the request is for the secondary site and attached application instances are not stopped" do
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
              host: build(:host, heartbeat: :passing, cluster: nil)
            ),
            build(:database_instance,
              health: Health.unknown(),
              system_replication: "Secondary",
              system_replication_site: "Site2",
              host: build(:host, heartbeat: :passing, cluster: nil)
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
