defmodule Trento.ClusterTest do
  use Trento.AggregateCase, aggregate: Trento.Clusters.Cluster, async: true

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  import Trento.Factory

  alias Trento.Support.StructHelper

  alias Trento.Clusters.Commands.{
    CompleteChecksExecution,
    DeregisterClusterHost,
    RegisterOfflineClusterHost,
    RegisterOnlineClusterHost,
    RollUpCluster,
    SelectChecks
  }

  alias Trento.Domain.Events.{
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    HostChecksExecutionCompleted
  }

  alias Trento.Clusters.Events.{
    ChecksSelected,
    ClusterChecksHealthChanged,
    ClusterDeregistered,
    ClusterDetailsUpdated,
    ClusterDiscoveredHealthChanged,
    ClusterHealthChanged,
    ClusterHostStatusChanged,
    ClusterRegistered,
    ClusterRestored,
    ClusterRolledUp,
    ClusterRollUpRequested,
    ClusterTombstoned,
    HostAddedToCluster,
    HostRemovedFromCluster
  }

  alias Trento.Clusters.Cluster

  require Trento.Enums.Health, as: Health

  describe "cluster registration" do
    test "should register a cluster with full details and add the node host to the cluster if the node is a DC" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      type = :hana_scale_up
      sap_instances = build_list(2, :clustered_sap_instance)

      assert_events_and_state(
        [],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sap_instances: Enum.map(sap_instances, &Map.from_struct/1),
          provider: :azure,
          type: type,
          details: nil,
          discovered_health: :passing,
          designated_controller: true
        }),
        [
          %ClusterRegistered{
            cluster_id: cluster_id,
            name: name,
            sap_instances: sap_instances,
            provider: :azure,
            type: type,
            health: :passing,
            details: nil
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.online()
          }
        ],
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          sap_instances: sap_instances,
          type: type,
          provider: :azure,
          hosts: [host_id],
          discovered_health: :passing,
          health: :passing
        }
      )
    end

    test "should register a cluster with unknown details when the cluster was not registered yet and a message from a non-DC is received" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()

      assert_events_and_state(
        [],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          discovered_health: :unknown,
          provider: :unknown,
          type: :unknown,
          designated_controller: false
        }),
        [
          %ClusterRegistered{
            cluster_id: cluster_id,
            name: name,
            sap_instances: [],
            provider: :unknown,
            type: :unknown,
            health: :unknown,
            details: nil
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.online()
          }
        ],
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          sap_instances: [],
          type: :unknown,
          provider: :unknown,
          hosts: [host_id],
          offline_hosts: [],
          discovered_health: :unknown,
          health: :unknown
        }
      )
    end

    test "should register a cluster with unknown details when the cluster was not registered yet and a message from an offline node is received" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()

      assert_events_and_state(
        [],
        RegisterOfflineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name
        }),
        [
          %ClusterRegistered{
            cluster_id: cluster_id,
            name: name,
            sap_instances: [],
            provider: :unknown,
            type: :unknown,
            health: :unknown,
            details: nil
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.offline()
          }
        ],
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          sap_instances: [],
          type: :unknown,
          provider: :unknown,
          hosts: [host_id],
          offline_hosts: [host_id],
          discovered_health: :unknown,
          health: :unknown
        }
      )
    end

    test "should add a host to the cluster if the host is not a DC and the cluster is already registered" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      sap_instances = build_list(2, :clustered_sap_instance)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id),
          build(:host_added_to_cluster_event, cluster_id: cluster_id)
        ],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sap_instances: Enum.map(sap_instances, &Map.from_struct/1),
          type: :hana_scale_up,
          discovered_health: :unknown,
          designated_controller: false,
          provider: :azure
        }),
        [
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.online()
          }
        ],
        fn cluster ->
          assert %Cluster{
                   hosts: [^host_id | _]
                 } = cluster
        end
      )
    end

    test "should set a host as offline when it goes offline" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id),
          build(:host_added_to_cluster_event,
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.online()
          )
        ],
        RegisterOfflineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name
        }),
        [
          %ClusterHostStatusChanged{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.offline()
          }
        ],
        fn cluster ->
          assert %Cluster{
                   hosts: [^host_id | _],
                   offline_hosts: [^host_id | _]
                 } = cluster
        end
      )
    end

    test "should set a host as online when it goes online" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id),
          build(:host_added_to_cluster_event,
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.offline()
          )
        ],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sap_instances: [],
          type: :hana_scale_up,
          discovered_health: :passing,
          resources_number: 8,
          hosts_number: 2,
          designated_controller: false,
          provider: :azure
        }),
        [
          %ClusterHostStatusChanged{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.online()
          }
        ],
        fn cluster ->
          assert %Cluster{
                   hosts: [^host_id | _],
                   offline_hosts: []
                 } = cluster
        end
      )
    end

    test "should not emit event when status does not change" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      another_host_id = Faker.UUID.v4()
      another_name = Faker.StarWars.character()

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id),
          build(:host_added_to_cluster_event,
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.offline()
          ),
          build(:host_added_to_cluster_event,
            cluster_id: cluster_id,
            host_id: another_host_id,
            cluster_host_status: ClusterHostStatus.online()
          )
        ],
        [
          RegisterOfflineClusterHost.new!(%{
            cluster_id: cluster_id,
            host_id: host_id,
            name: name
          }),
          RegisterOnlineClusterHost.new!(%{
            cluster_id: cluster_id,
            host_id: another_host_id,
            name: another_name,
            sap_instances: [],
            type: :hana_scale_up,
            discovered_health: :passing,
            resources_number: 8,
            hosts_number: 2,
            designated_controller: false,
            provider: :azure
          })
        ],
        [],
        fn cluster ->
          assert %Cluster{
                   hosts: [^another_host_id, ^host_id | _],
                   offline_hosts: [^host_id | _]
                 } = cluster
        end
      )
    end

    test "should add a host to the cluster if the host is a DC and the cluster is already registered" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      sap_instances = build_list(2, :clustered_sap_instance)

      assert_events_and_state(
        [
          build(
            :cluster_registered_event,
            cluster_id: cluster_id,
            provider: :azure,
            sap_instances: sap_instances,
            name: name,
            details: nil
          ),
          build(:host_added_to_cluster_event, cluster_id: cluster_id)
        ],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sap_instances: Enum.map(sap_instances, &Map.from_struct/1),
          type: :hana_scale_up,
          discovered_health: :passing,
          resources_number: 8,
          hosts_number: 2,
          designated_controller: true,
          provider: :azure
        }),
        [
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id,
            cluster_host_status: ClusterHostStatus.online()
          }
        ],
        fn cluster ->
          assert %Cluster{
                   hosts: [^host_id | _]
                 } = cluster
        end
      )
    end
  end

  describe "cluster details" do
    test "should update cluster details" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      new_name = Faker.StarWars.character()
      new_sap_instances = build_list(2, :clustered_sap_instance)

      initial_events = [
        build(:cluster_registered_event, cluster_id: cluster_id),
        %HostAddedToCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.online()
        }
      ]

      details = build(:hana_cluster_details)

      assert_events_and_state(
        initial_events,
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: new_name,
          sap_instances: Enum.map(new_sap_instances, &Map.from_struct/1),
          provider: :gcp,
          type: :hana_scale_up,
          resources_number: 2,
          hosts_number: 1,
          discovered_health: :passing,
          details: StructHelper.to_map(details),
          designated_controller: true
        }),
        %ClusterDetailsUpdated{
          cluster_id: cluster_id,
          name: new_name,
          sap_instances: new_sap_instances,
          provider: :gcp,
          type: :hana_scale_up,
          resources_number: 2,
          hosts_number: 1,
          details: details
        },
        fn cluster ->
          %Cluster{
            cluster_id: ^cluster_id,
            name: ^new_name,
            sap_instances: ^new_sap_instances,
            provider: :gcp,
            resources_number: 2,
            hosts_number: 1,
            details: ^details
          } = cluster
        end
      )
    end

    test "should not update cluster details if the details did not change" do
      cluster_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      sap_instances = build_list(2, :clustered_sap_instance)
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:cluster_registered_event,
          cluster_id: cluster_id,
          name: name,
          sap_instances: sap_instances,
          details: nil,
          provider: :azure
        ),
        build(:host_added_to_cluster_event,
          cluster_id: cluster_id,
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.online()
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sap_instances: Enum.map(sap_instances, &Map.from_struct/1),
          provider: :azure,
          resources_number: 8,
          hosts_number: 2,
          details: nil,
          type: :hana_scale_up,
          discovered_health: :passing,
          designated_controller: true
        }),
        [],
        fn cluster ->
          assert %Cluster{
                   name: ^name,
                   sap_instances: ^sap_instances,
                   provider: :azure,
                   type: :hana_scale_up
                 } = cluster
        end
      )
    end
  end

  describe "checks execution" do
    test "should select desired checks" do
      cluster_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_events_and_state(
        [build(:cluster_registered_event, cluster_id: cluster_id)],
        SelectChecks.new!(%{
          cluster_id: cluster_id,
          checks: selected_checks
        }),
        [
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: selected_checks
          }
        ],
        fn cluster ->
          assert %Cluster{
                   selected_checks: ^selected_checks
                 } = cluster
        end
      )
    end

    test "should use discovered cluster health when no checks are selected" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      sap_instances = build_list(2, :clustered_sap_instance)

      assert_events_and_state(
        [
          build(
            :cluster_registered_event,
            cluster_id: cluster_id,
            name: name,
            sap_instances: sap_instances,
            details: nil,
            provider: :azure
          ),
          build(
            :host_added_to_cluster_event,
            cluster_id: cluster_id,
            host_id: host_id
          )
        ],
        [
          build(
            :register_online_cluster_host,
            host_id: host_id,
            cluster_id: cluster_id,
            name: name,
            sap_instances: sap_instances,
            details: nil,
            discovered_health: :passing,
            provider: :azure
          ),
          SelectChecks.new!(%{
            cluster_id: cluster_id,
            checks: []
          })
        ],
        [
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: []
          }
        ],
        fn cluster ->
          assert %Cluster{
                   selected_checks: [],
                   health: :passing
                 } = cluster
        end
      )
    end

    test "should change health state when checks health changes" do
      cluster_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, health: Health.passing()),
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: selected_checks
          }
        ],
        CompleteChecksExecution.new!(%{
          cluster_id: cluster_id,
          health: Health.critical()
        }),
        [
          %ClusterChecksHealthChanged{
            cluster_id: cluster_id,
            checks_health: Health.critical()
          },
          %ClusterHealthChanged{
            cluster_id: cluster_id,
            health: Health.critical()
          }
        ],
        fn cluster ->
          assert %Cluster{
                   cluster_id: ^cluster_id,
                   health: Health.critical(),
                   checks_health: Health.critical()
                 } = cluster
        end
      )
    end

    test "should not change the the cluster aggregated health if discovery health is worse" do
      cluster_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, health: Health.critical()),
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: selected_checks
          },
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_id,
            discovered_health: Health.critical()
          }
        ],
        CompleteChecksExecution.new!(%{
          cluster_id: cluster_id,
          health: Health.warning()
        }),
        [
          %ClusterChecksHealthChanged{
            cluster_id: cluster_id,
            checks_health: Health.warning()
          }
        ],
        fn cluster ->
          assert %Cluster{
                   cluster_id: ^cluster_id,
                   health: Health.critical(),
                   checks_health: Health.warning()
                 } = cluster
        end
      )
    end

    test "unknown checks health should not affect aggregated cluster's health" do
      cluster_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, health: Health.passing()),
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_id,
            discovered_health: Health.passing()
          }
        ],
        SelectChecks.new!(%{
          cluster_id: cluster_id,
          checks: selected_checks
        }),
        [
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: selected_checks
          }
        ],
        fn cluster ->
          assert %Cluster{
                   cluster_id: ^cluster_id,
                   health: Health.passing(),
                   checks_health: Health.unknown()
                 } = cluster
        end
      )
    end

    test "should not update health when an empty checks selection is saved" do
      cluster_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, health: Health.critical()),
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: selected_checks
          },
          %ClusterChecksHealthChanged{
            cluster_id: cluster_id,
            checks_health: Health.warning()
          },
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_id,
            discovered_health: Health.critical()
          }
        ],
        SelectChecks.new!(%{
          cluster_id: cluster_id,
          checks: []
        }),
        [
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: []
          }
        ],
        fn cluster ->
          assert %Cluster{
                   cluster_id: ^cluster_id,
                   health: Health.critical(),
                   checks_health: Health.warning()
                 } = cluster
        end
      )
    end

    test "should not change health if it is already critical" do
      cluster_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, health: Health.critical()),
          %ChecksSelected{
            cluster_id: cluster_id,
            checks: selected_checks
          },
          %ClusterChecksHealthChanged{
            cluster_id: cluster_id,
            checks_health: Health.critical()
          },
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_id,
            discovered_health: Health.critical()
          }
        ],
        CompleteChecksExecution.new!(%{
          cluster_id: cluster_id,
          health: Health.critical()
        }),
        [],
        fn cluster ->
          assert %Cluster{
                   cluster_id: ^cluster_id,
                   health: Health.critical(),
                   checks_health: Health.critical()
                 } = cluster
        end
      )
    end
  end

  describe "discovered health" do
    test "should change the discovered health and the cluster aggregated health" do
      cluster_registered_event = build(:cluster_registered_event, health: :passing)

      host_added_to_cluster_event =
        build(:host_added_to_cluster_event, cluster_id: cluster_registered_event.cluster_id)

      assert_events_and_state(
        [
          cluster_registered_event,
          host_added_to_cluster_event,
          %ClusterChecksHealthChanged{
            cluster_id: cluster_registered_event.cluster_id,
            checks_health: Health.unknown()
          },
          %ChecksSelected{
            cluster_id: cluster_registered_event.cluster_id,
            checks: []
          }
        ],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_registered_event.cluster_id,
          host_id: host_added_to_cluster_event.host_id,
          name: cluster_registered_event.name,
          sap_instances: Enum.map(cluster_registered_event.sap_instances, &Map.from_struct/1),
          provider: cluster_registered_event.provider,
          type: cluster_registered_event.type,
          resources_number: cluster_registered_event.resources_number,
          hosts_number: cluster_registered_event.hosts_number,
          details: StructHelper.to_map(cluster_registered_event.details),
          designated_controller: true,
          discovered_health: :warning
        }),
        [
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_registered_event.cluster_id,
            discovered_health: :warning
          },
          %ClusterHealthChanged{
            cluster_id: cluster_registered_event.cluster_id,
            health: :warning
          }
        ],
        fn cluster ->
          %Cluster{
            discovered_health: :warning,
            checks_health: Health.unknown(),
            health: :warning
          } = cluster
        end
      )
    end

    test "should not change the discovered health" do
      cluster_registered_event =
        build(:cluster_registered_event, health: :passing, provider: :azure)

      host_added_to_cluster_event =
        build(:host_added_to_cluster_event, cluster_id: cluster_registered_event.cluster_id)

      assert_events_and_state(
        [
          cluster_registered_event,
          %HostAddedToCluster{
            cluster_id: cluster_registered_event.cluster_id,
            host_id: host_added_to_cluster_event.host_id,
            cluster_host_status: host_added_to_cluster_event.cluster_host_status
          }
        ],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_registered_event.cluster_id,
          host_id: host_added_to_cluster_event.host_id,
          name: cluster_registered_event.name,
          sap_instances: Enum.map(cluster_registered_event.sap_instances, &Map.from_struct/1),
          type: cluster_registered_event.type,
          resources_number: cluster_registered_event.resources_number,
          hosts_number: cluster_registered_event.hosts_number,
          discovered_health: :passing,
          details: StructHelper.to_map(cluster_registered_event.details),
          designated_controller: true,
          provider: :azure
        }),
        [],
        fn cluster ->
          %Cluster{
            discovered_health: :passing
          } = cluster
        end
      )
    end

    test "should not change the the cluster aggregated health if checks health is worse" do
      cluster_registered_event =
        build(:cluster_registered_event, health: :passing, provider: :azure)

      host_added_to_cluster_event =
        build(:host_added_to_cluster_event, cluster_id: cluster_registered_event.cluster_id)

      assert_events_and_state(
        [
          cluster_registered_event,
          host_added_to_cluster_event,
          %ChecksSelected{
            cluster_id: cluster_registered_event.cluster_id,
            checks: [Faker.Cat.name()]
          },
          %ClusterChecksHealthChanged{
            cluster_id: cluster_registered_event.cluster_id,
            checks_health: :critical
          },
          %ClusterHealthChanged{
            cluster_id: cluster_registered_event.cluster_id,
            health: :critical
          }
        ],
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_registered_event.cluster_id,
          host_id: host_added_to_cluster_event.host_id,
          name: cluster_registered_event.name,
          sap_instances: Enum.map(cluster_registered_event.sap_instances, &Map.from_struct/1),
          provider: :azure,
          type: cluster_registered_event.type,
          resources_number: cluster_registered_event.resources_number,
          hosts_number: cluster_registered_event.hosts_number,
          details: StructHelper.to_map(cluster_registered_event.details),
          designated_controller: true,
          discovered_health: :warning
        }),
        [
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_registered_event.cluster_id,
            discovered_health: :warning
          }
        ],
        fn cluster ->
          %Cluster{
            discovered_health: :warning,
            checks_health: :critical,
            health: :critical
          } = cluster
        end
      )
    end
  end

  describe "rollup" do
    test "should not accept a rollup command if a cluster was not registered yet" do
      assert_error(
        RollUpCluster.new!(%{cluster_id: Faker.UUID.v4()}),
        {:error, :cluster_not_registered}
      )
    end

    test "should change the cluster state to rolling up" do
      cluster_id = Faker.UUID.v4()
      cluster_registered_event = build(:cluster_registered_event, cluster_id: cluster_id)

      assert_events_and_state(
        cluster_registered_event,
        RollUpCluster.new!(%{cluster_id: cluster_id}),
        %ClusterRollUpRequested{
          cluster_id: cluster_id,
          snapshot: %Cluster{
            cluster_id: cluster_id,
            name: cluster_registered_event.name,
            type: cluster_registered_event.type,
            sap_instances: cluster_registered_event.sap_instances,
            provider: cluster_registered_event.provider,
            resources_number: cluster_registered_event.resources_number,
            hosts_number: cluster_registered_event.hosts_number,
            details: cluster_registered_event.details,
            health: cluster_registered_event.health,
            hosts: [],
            selected_checks: [],
            discovered_health: Health.passing(),
            checks_health: Health.unknown()
          }
        },
        fn %Cluster{rolling_up: rolling_up} ->
          assert rolling_up
        end
      )
    end

    test "should apply the rollup event" do
      cluster_id = Faker.UUID.v4()
      cluster_registered_event = build(:cluster_registered_event, cluster_id: cluster_id)

      assert_state(
        [
          cluster_registered_event,
          %ClusterRolledUp{
            snapshot: %Cluster{
              cluster_id: cluster_id,
              name: cluster_registered_event.name,
              type: cluster_registered_event.type,
              sap_instances: cluster_registered_event.sap_instances,
              provider: cluster_registered_event.provider,
              resources_number: cluster_registered_event.resources_number,
              hosts_number: cluster_registered_event.hosts_number,
              details: cluster_registered_event.details,
              health: cluster_registered_event.health,
              hosts: [],
              selected_checks: [],
              discovered_health: Health.passing(),
              checks_health: Health.unknown()
            }
          }
        ],
        [],
        fn cluster ->
          refute cluster.rolling_up
          assert cluster.name == cluster_registered_event.name
          assert cluster.type == cluster_registered_event.type
          assert cluster.sap_instances == cluster_registered_event.sap_instances
          assert cluster.provider == cluster_registered_event.provider
          assert cluster.resources_number == cluster_registered_event.resources_number
          assert cluster.hosts_number == cluster_registered_event.hosts_number
          assert cluster.details == cluster_registered_event.details
          assert cluster.health == cluster_registered_event.health
          assert cluster.hosts == []
          assert cluster.selected_checks == []
          assert cluster.discovered_health == Health.passing()
        end
      )
    end

    test "should not accept commands if a cluster is in rolling up state" do
      cluster_id = Faker.UUID.v4()
      sap_instances = build_list(2, :clustered_sap_instance)

      events = [
        build(:cluster_registered_event, cluster_id: cluster_id),
        %ClusterRollUpRequested{
          cluster_id: cluster_id
        }
      ]

      assert_error(
        events,
        RegisterOnlineClusterHost.new!(%{
          cluster_id: cluster_id,
          host_id: Faker.UUID.v4(),
          name: Faker.StarWars.character(),
          sap_instances: Enum.map(sap_instances, &Map.from_struct/1),
          discovered_health: :unknown,
          type: :hana_scale_up,
          designated_controller: false,
          provider: :azure
        }),
        {:error, :cluster_rolling_up}
      )

      assert_error(
        events,
        CompleteChecksExecution.new!(%{cluster_id: cluster_id, health: :unknown}),
        {:error, :cluster_rolling_up}
      )

      assert_error(
        events,
        RollUpCluster.new!(%{cluster_id: cluster_id}),
        {:error, :cluster_rolling_up}
      )
    end
  end

  describe "deregistration" do
    test "should restore a deregistered cluster when a RegisterOnlineClusterHost command from a non DC host is received" do
      host_one_id = UUID.uuid4()
      host_two_id = UUID.uuid4()

      cluster_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:cluster_deregistered_event,
          cluster_id: cluster_id,
          deregistered_at: deregistered_at
        )
      ]

      new_host_id = UUID.uuid4()

      restoration_command =
        build(
          :register_online_cluster_host,
          cluster_id: cluster_id,
          host_id: new_host_id,
          designated_controller: false
        )

      assert_events_and_state(
        initial_events,
        [restoration_command],
        [
          %ClusterRestored{
            cluster_id: cluster_id
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: new_host_id,
            cluster_host_status: ClusterHostStatus.online()
          }
        ],
        fn cluster ->
          assert nil == cluster.deregistered_at
        end
      )
    end

    test "should restore a deregistered cluster when a RegisterOfflineClusterHost command is received" do
      host_one_id = UUID.uuid4()
      host_two_id = UUID.uuid4()

      cluster_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:cluster_deregistered_event,
          cluster_id: cluster_id,
          deregistered_at: deregistered_at
        )
      ]

      new_host_id = UUID.uuid4()

      restoration_command =
        build(
          :register_offline_cluster_host,
          cluster_id: cluster_id,
          host_id: new_host_id
        )

      assert_events_and_state(
        initial_events,
        [restoration_command],
        [
          %ClusterRestored{
            cluster_id: cluster_id
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: new_host_id,
            cluster_host_status: ClusterHostStatus.offline()
          }
        ],
        fn cluster ->
          assert nil == cluster.deregistered_at
        end
      )
    end

    test "should restore a deregistered cluster and perform the cluster update procedure when a RegisterOnlineClusterHost command from a DC host is received" do
      host_one_id = UUID.uuid4()
      host_two_id = UUID.uuid4()

      cluster_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:cluster_deregistered_event,
          cluster_id: cluster_id,
          deregistered_at: deregistered_at
        )
      ]

      new_host_id = UUID.uuid4()

      restoration_command =
        build(
          :register_online_cluster_host,
          cluster_id: cluster_id,
          host_id: new_host_id,
          discovered_health: :critical,
          designated_controller: true
        )

      assert_events_and_state(
        initial_events,
        [restoration_command],
        [
          %ClusterRestored{
            cluster_id: cluster_id
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: new_host_id,
            cluster_host_status: ClusterHostStatus.online()
          },
          %ClusterDetailsUpdated{
            cluster_id: cluster_id,
            name: restoration_command.name,
            type: restoration_command.type,
            sap_instances: restoration_command.sap_instances,
            provider: restoration_command.provider,
            resources_number: restoration_command.resources_number,
            hosts_number: restoration_command.hosts_number,
            details: restoration_command.details
          },
          %ClusterDiscoveredHealthChanged{
            cluster_id: cluster_id,
            discovered_health: :critical
          },
          %ClusterHealthChanged{
            cluster_id: cluster_id,
            health: :critical
          }
        ],
        fn cluster ->
          assert nil == cluster.deregistered_at
        end
      )
    end

    test "should reject all the commands when the host is deregistered" do
      host_one_id = UUID.uuid4()
      host_two_id = UUID.uuid4()

      cluster_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_added_to_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_one_id),
        build(:host_removed_from_cluster_event, cluster_id: cluster_id, host_id: host_two_id),
        build(:cluster_deregistered_event,
          cluster_id: cluster_id,
          deregistered_at: deregistered_at
        )
      ]

      commands_to_reject = [
        %CompleteChecksExecution{cluster_id: cluster_id},
        %DeregisterClusterHost{cluster_id: cluster_id},
        %SelectChecks{cluster_id: cluster_id}
      ]

      for command <- commands_to_reject do
        assert match?({:error, :cluster_not_registered}, aggregate_run(initial_events, command)),
               "Command #{inspect(command)} should be rejected by the aggregate"
      end

      commands_to_accept = [
        %RollUpCluster{cluster_id: cluster_id},
        %RegisterOnlineClusterHost{cluster_id: cluster_id, designated_controller: true},
        %RegisterOnlineClusterHost{cluster_id: cluster_id, designated_controller: false}
      ]

      for command <- commands_to_accept do
        assert match?({:ok, _, _}, aggregate_run(initial_events, command)),
               "Command #{inspect(command)} should be accepted by a deregistered cluster"
      end
    end

    test "should emit the HostRemovedFromCluster event after a DeregisterClusterHost command and remove the host from the cluster aggregate state" do
      cluster_id = Faker.UUID.v4()
      dat = DateTime.utc_now()
      host_1_added_event = build(:host_added_to_cluster_event, cluster_id: cluster_id)

      host_2_added_event =
        %{host_id: host_2_id} = build(:host_added_to_cluster_event, cluster_id: cluster_id)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
          host_1_added_event,
          host_2_added_event
        ],
        [
          %DeregisterClusterHost{
            host_id: host_1_added_event.host_id,
            cluster_id: cluster_id,
            deregistered_at: dat
          }
        ],
        [
          %HostRemovedFromCluster{
            host_id: host_1_added_event.host_id,
            cluster_id: cluster_id
          }
        ],
        fn cluster ->
          assert %Cluster{hosts: [^host_2_id], offline_hosts: []} = cluster
        end
      )
    end

    test "should emit the HostRemovedFromCluster event after a DeregisterClusterHost command and remove the host from the cluster aggregate state when the host is offline" do
      cluster_id = Faker.UUID.v4()
      dat = DateTime.utc_now()

      host_1_added_event =
        build(:host_added_to_cluster_event,
          cluster_id: cluster_id,
          cluster_host_status: ClusterHostStatus.offline()
        )

      host_2_added_event =
        %{host_id: host_2_id} = build(:host_added_to_cluster_event, cluster_id: cluster_id)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
          host_1_added_event,
          host_2_added_event
        ],
        [
          %DeregisterClusterHost{
            host_id: host_1_added_event.host_id,
            cluster_id: cluster_id,
            deregistered_at: dat
          }
        ],
        [
          %HostRemovedFromCluster{
            host_id: host_1_added_event.host_id,
            cluster_id: cluster_id
          }
        ],
        fn cluster ->
          assert %Cluster{hosts: [^host_2_id], offline_hosts: []} = cluster
        end
      )
    end

    test "should emit the ClusterDeregistered and ClusterTombstoned events when the last ClusterHost is deregistered and set the deregistration date into the state" do
      cluster_id = Faker.UUID.v4()
      dat = DateTime.utc_now()
      host_1_added_event = build(:host_added_to_cluster_event, cluster_id: cluster_id)
      host_2_added_event = build(:host_added_to_cluster_event, cluster_id: cluster_id)

      assert_events_and_state(
        [
          build(:cluster_registered_event, cluster_id: cluster_id, hosts_number: 2),
          host_1_added_event,
          host_2_added_event
        ],
        [
          %DeregisterClusterHost{
            host_id: host_1_added_event.host_id,
            cluster_id: cluster_id,
            deregistered_at: dat
          },
          %DeregisterClusterHost{
            host_id: host_2_added_event.host_id,
            cluster_id: cluster_id,
            deregistered_at: dat
          }
        ],
        [
          %HostRemovedFromCluster{
            host_id: host_1_added_event.host_id,
            cluster_id: cluster_id
          },
          %HostRemovedFromCluster{
            host_id: host_2_added_event.host_id,
            cluster_id: cluster_id
          },
          %ClusterDeregistered{
            cluster_id: cluster_id,
            deregistered_at: dat
          },
          %ClusterTombstoned{
            cluster_id: cluster_id
          }
        ],
        fn cluster -> assert dat == cluster.deregistered_at end
      )
    end
  end

  describe "legacy events" do
    test "should ignore legacy events and not update the aggregate" do
      cluster_id = Faker.UUID.v4()

      cluster_registered_event =
        build(
          :cluster_registered_event,
          cluster_id: cluster_id
        )

      assert_state(
        [
          cluster_registered_event,
          %ChecksExecutionCompleted{cluster_id: cluster_id},
          %ChecksExecutionRequested{cluster_id: cluster_id},
          %ChecksExecutionStarted{cluster_id: cluster_id},
          %HostChecksExecutionCompleted{cluster_id: cluster_id}
        ],
        [],
        fn cluster ->
          assert cluster.name == cluster_registered_event.name
          assert cluster.type == cluster_registered_event.type
          assert cluster.sap_instances == cluster_registered_event.sap_instances
          assert cluster.provider == cluster_registered_event.provider
          assert cluster.resources_number == cluster_registered_event.resources_number
          assert cluster.hosts_number == cluster_registered_event.hosts_number
          assert cluster.details == cluster_registered_event.details
          assert cluster.health == cluster_registered_event.health
          assert cluster.hosts == []
          assert cluster.selected_checks == []
          assert cluster.discovered_health == :passing
        end
      )
    end
  end
end
