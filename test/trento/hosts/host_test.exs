defmodule Trento.Hosts.HostTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true

  import Trento.Factory

  alias Trento.Support.StructHelper

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteHostChecksExecution,
    CompleteSoftwareUpdatesDiscovery,
    DeregisterHost,
    RegisterHost,
    RequestHostDeregistration,
    RollUpHost,
    SelectHostChecks,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions
  }

  alias Trento.Hosts.Events.{
    HeartbeatFailed,
    HeartbeatSucceeded,
    HostChecksHealthChanged,
    HostChecksSelected,
    HostDeregistered,
    HostDeregistrationRequested,
    HostDetailsUpdated,
    HostHealthChanged,
    HostRegistered,
    HostRestored,
    HostRolledUp,
    HostRollUpRequested,
    HostSaptuneHealthChanged,
    HostTombstoned,
    ProviderUpdated,
    SaptuneStatusUpdated,
    SlesSubscriptionsUpdated,
    SoftwareUpdatesDiscoveryCleared,
    SoftwareUpdatesDiscoveryRequested,
    SoftwareUpdatesHealthChanged
  }

  alias Trento.Hosts.ValueObjects.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  alias Trento.Hosts.Host

  alias Trento.Hosts.ValueObjects.{
    SaptuneStatus,
    SlesSubscription
  }

  require Trento.Enums.Health, as: Health
  require Trento.Enums.Architecture, as: Architecture
  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  describe "host registration" do
    test "should register a host" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()
      cpu_count = Enum.random(1..16)
      total_memory_mb = Enum.random(1..128)
      socket_count = Enum.random(1..16)
      os_version = Faker.App.version()
      arch = Enum.random(Architecture.values())
      installation_source = Enum.random([:community, :suse, :unknown])
      prometheus_targets = build(:host_prometheus_targets)

      assert_events_and_state(
        [],
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          fully_qualified_domain_name: nil,
          prometheus_targets: prometheus_targets
        }),
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets,
          heartbeat: :unknown
        },
        %Host{
          host_id: host_id,
          hostname: hostname,
          fully_qualified_domain_name: nil,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets,
          heartbeat: :unknown
        }
      )
    end

    test "should register a host with an FQDN and emit software updates discovery request" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      fully_qualified_domain_name = Faker.Internet.domain_name()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()
      cpu_count = Enum.random(1..16)
      total_memory_mb = Enum.random(1..128)
      socket_count = Enum.random(1..16)
      os_version = Faker.App.version()
      arch = Enum.random(Architecture.values())
      installation_source = Enum.random([:community, :suse, :unknown])
      prometheus_targets = build(:host_prometheus_targets)

      assert_events_and_state(
        [],
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: hostname,
          fully_qualified_domain_name: fully_qualified_domain_name,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets
        }),
        [
          %HostRegistered{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: fully_qualified_domain_name,
            ip_addresses: ip_addresses,
            agent_version: agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets,
            heartbeat: :unknown
          },
          %SoftwareUpdatesDiscoveryRequested{
            host_id: host_id,
            fully_qualified_domain_name: fully_qualified_domain_name
          }
        ],
        %Host{
          host_id: host_id,
          hostname: hostname,
          fully_qualified_domain_name: fully_qualified_domain_name,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets,
          heartbeat: :unknown
        }
      )
    end

    test "should update FQDN and emit a request for software updates discovery" do
      scenarios = [
        %{
          initial_fqdn: nil,
          new_fqdn: Faker.Internet.domain_name()
        },
        %{
          initial_fqdn: Faker.Internet.domain_name(),
          new_fqdn: Faker.Internet.ip_v4_address()
        }
      ]

      for %{
            initial_fqdn: initial_fqdn,
            new_fqdn: new_fqdn
          } <- scenarios do
        host_id = Faker.UUID.v4()
        hostname = Faker.StarWars.character()
        ip_addresses = [Faker.Internet.ip_v4_address()]
        agent_version = Faker.Internet.slug()
        cpu_count = Enum.random(1..16)
        total_memory_mb = Enum.random(1..128)
        socket_count = Enum.random(1..16)
        os_version = Faker.App.version()
        arch = Enum.random(Architecture.values())
        installation_source = Enum.random([:community, :suse, :unknown])
        prometheus_targets = build(:host_prometheus_targets)

        assert_events_and_state(
          build(:host_registered_event,
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: initial_fqdn,
            ip_addresses: ip_addresses,
            agent_version: agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets
          ),
          RegisterHost.new!(%{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: new_fqdn,
            ip_addresses: ip_addresses,
            agent_version: agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets
          }),
          [
            %HostDetailsUpdated{
              host_id: host_id,
              hostname: hostname,
              fully_qualified_domain_name: new_fqdn,
              ip_addresses: ip_addresses,
              agent_version: agent_version,
              cpu_count: cpu_count,
              total_memory_mb: total_memory_mb,
              socket_count: socket_count,
              os_version: os_version,
              arch: arch,
              installation_source: installation_source,
              prometheus_targets: prometheus_targets
            },
            %SoftwareUpdatesDiscoveryRequested{
              host_id: host_id,
              fully_qualified_domain_name: new_fqdn
            }
          ],
          %Host{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: new_fqdn,
            ip_addresses: ip_addresses,
            agent_version: agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets,
            heartbeat: :unknown
          }
        )
      end
    end

    test "should not emit a request for software updates discovery when FQDN did not change on host details updated" do
      unchanging_fqdns = [
        nil,
        Faker.Internet.domain_name()
      ]

      for unchanged_fqdn <- unchanging_fqdns do
        host_id = Faker.UUID.v4()
        hostname = Faker.StarWars.character()
        ip_addresses = [Faker.Internet.ip_v4_address()]
        cpu_count = Enum.random(1..16)
        total_memory_mb = Enum.random(1..128)
        socket_count = Enum.random(1..16)
        os_version = Faker.App.version()
        arch = Enum.random(Architecture.values())
        installation_source = Enum.random([:community, :suse, :unknown])
        prometheus_targets = %{}

        initial_agent_version = Faker.Internet.slug()
        new_agent_version = Faker.StarWars.character()

        assert_events_and_state(
          build(:host_registered_event,
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: unchanged_fqdn,
            ip_addresses: ip_addresses,
            agent_version: initial_agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets
          ),
          RegisterHost.new!(%{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: unchanged_fqdn,
            ip_addresses: ip_addresses,
            agent_version: new_agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets
          }),
          %HostDetailsUpdated{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: unchanged_fqdn,
            ip_addresses: ip_addresses,
            agent_version: new_agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets
          },
          %Host{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: unchanged_fqdn,
            ip_addresses: ip_addresses,
            agent_version: new_agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets,
            heartbeat: :unknown
          }
        )
      end
    end

    test "should clear software updates discovery when FQDN gets nullified" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()
      cpu_count = Enum.random(1..16)
      total_memory_mb = Enum.random(1..128)
      socket_count = Enum.random(1..16)
      os_version = Faker.App.version()
      arch = Enum.random(Architecture.values())
      installation_source = Enum.random([:community, :suse, :unknown])
      prometheus_targets = build(:host_prometheus_targets)

      current_fully_qualified_domain_name = Faker.Internet.ip_v4_address()
      new_fully_qualified_domain_name = nil

      assert_events_and_state(
        build(:host_registered_event,
          host_id: host_id,
          hostname: hostname,
          fully_qualified_domain_name: current_fully_qualified_domain_name,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets
        ),
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: hostname,
          fully_qualified_domain_name: new_fully_qualified_domain_name,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets
        }),
        [
          %HostDetailsUpdated{
            host_id: host_id,
            hostname: hostname,
            fully_qualified_domain_name: new_fully_qualified_domain_name,
            ip_addresses: ip_addresses,
            agent_version: agent_version,
            cpu_count: cpu_count,
            total_memory_mb: total_memory_mb,
            socket_count: socket_count,
            os_version: os_version,
            arch: arch,
            installation_source: installation_source,
            prometheus_targets: prometheus_targets
          },
          %SoftwareUpdatesDiscoveryCleared{
            host_id: host_id
          }
        ],
        %Host{
          host_id: host_id,
          hostname: hostname,
          fully_qualified_domain_name: new_fully_qualified_domain_name,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          arch: arch,
          installation_source: installation_source,
          prometheus_targets: prometheus_targets,
          heartbeat: :unknown
        }
      )
    end

    test "should update host details if it is already registered" do
      host_id = Faker.UUID.v4()
      new_hostname = Faker.StarWars.character()
      new_ip_addresses = [Faker.Internet.ip_v4_address()]
      new_agent_version = Faker.Internet.slug()
      new_cpu_count = Enum.random(1..16)
      new_total_memory_mb = Enum.random(1..128)
      new_socket_count = Enum.random(1..16)
      new_os_version = Faker.App.version()
      new_arch = Architecture.x86_64()
      new_installation_source = Enum.random([:community, :suse, :unknown])
      new_prometheus_targets = build(:host_prometheus_targets)
      fully_qualified_domain_name = Faker.Internet.domain_name()

      assert_events_and_state(
        build(:host_registered_event,
          host_id: host_id,
          arch: Architecture.unknown(),
          fully_qualified_domain_name: fully_qualified_domain_name
        ),
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: new_hostname,
          fully_qualified_domain_name: fully_qualified_domain_name,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          arch: new_arch,
          installation_source: new_installation_source,
          prometheus_targets: new_prometheus_targets
        }),
        %HostDetailsUpdated{
          host_id: host_id,
          hostname: new_hostname,
          fully_qualified_domain_name: fully_qualified_domain_name,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          arch: new_arch,
          installation_source: new_installation_source,
          prometheus_targets: new_prometheus_targets
        },
        %Host{
          host_id: host_id,
          hostname: new_hostname,
          fully_qualified_domain_name: fully_qualified_domain_name,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          arch: new_arch,
          installation_source: new_installation_source,
          prometheus_targets: new_prometheus_targets,
          heartbeat: :unknown
        }
      )
    end

    test "should not update host details if the same details were already registered" do
      host_registered_event = build(:host_registered_event)

      assert_events(
        host_registered_event,
        RegisterHost.new!(%{
          host_id: host_registered_event.host_id,
          hostname: host_registered_event.hostname,
          fully_qualified_domain_name: host_registered_event.fully_qualified_domain_name,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          cpu_count: host_registered_event.cpu_count,
          total_memory_mb: host_registered_event.total_memory_mb,
          socket_count: host_registered_event.socket_count,
          os_version: host_registered_event.os_version,
          arch: host_registered_event.arch,
          installation_source: host_registered_event.installation_source,
          prometheus_targets: host_registered_event.prometheus_targets
        }),
        []
      )
    end
  end

  describe "checks execution" do
    test "should select desired checks for host" do
      host_id = Faker.UUID.v4()
      selected_host_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        SelectHostChecks.new!(%{
          host_id: host_id,
          checks: selected_host_checks
        }),
        [
          %HostChecksSelected{
            host_id: host_id,
            checks: selected_host_checks
          }
        ],
        fn host ->
          assert %Host{
                   selected_checks: ^selected_host_checks
                 } = host
        end
      )
    end

    test "should not accept checks selection if a host is not registered yet" do
      host_id = Faker.UUID.v4()
      selected_host_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)

      assert_error(
        SelectHostChecks.new!(%{
          host_id: host_id,
          checks: selected_host_checks
        }),
        {:error, :host_not_registered}
      )
    end

    test "should not emit checks health change if previous execution result is the same as current" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      for health <- [Health.passing(), Health.warning(), Health.critical()] do
        host_checks_health_changed_event =
          build(:host_checks_health_changed, host_id: host_id, checks_health: health)

        assert_events_and_state(
          [
            host_registered_event,
            host_checks_health_changed_event
          ],
          CompleteHostChecksExecution.new!(%{
            host_id: host_id,
            health: health
          }),
          [],
          fn host ->
            assert %Host{
                     heartbeat: Health.unknown(),
                     checks_health: ^health,
                     health: Health.unknown()
                   } = host
          end
        )
      end
    end

    test "should emit checks health change when previous execution result differs from current" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      scenarios = [
        %{
          initial_checks_health: Health.passing(),
          current_checks_health: Health.warning()
        },
        %{
          initial_checks_health: Health.warning(),
          current_checks_health: Health.critical()
        },
        %{
          initial_checks_health: Health.critical(),
          current_checks_health: Health.passing()
        }
      ]

      for %{
            initial_checks_health: initial_checks_health,
            current_checks_health: current_checks_health
          } <- scenarios do
        host_checks_health_changed_event =
          build(:host_checks_health_changed,
            host_id: host_id,
            checks_health: initial_checks_health
          )

        assert_events_and_state(
          [
            host_registered_event,
            host_checks_health_changed_event
          ],
          CompleteHostChecksExecution.new!(%{
            host_id: host_id,
            health: current_checks_health
          }),
          [
            %HostChecksHealthChanged{host_id: host_id, checks_health: current_checks_health}
          ],
          fn host ->
            assert %Host{
                     heartbeat: Health.unknown(),
                     checks_health: ^current_checks_health,
                     health: Health.unknown()
                   } = host
          end
        )
      end
    end

    test "should emit checks health change and aggregated health change according to heartbeat and checks execution result" do
      host_id = Faker.UUID.v4()

      scenarios = [
        %{
          initial_health: Health.critical(),
          initial_heartbeat: {:heartbeat_succeded, :passing},
          initial_checks_health: Health.passing(),
          current_checks_health: Health.warning(),
          expected_events: [
            %HostChecksHealthChanged{host_id: host_id, checks_health: Health.warning()},
            %HostHealthChanged{host_id: host_id, health: Health.warning()}
          ],
          expected_health: Health.warning()
        },
        %{
          initial_health: Health.critical(),
          initial_heartbeat: {:heartbeat_failed, :critical},
          initial_checks_health: Health.critical(),
          current_checks_health: Health.passing(),
          expected_events: [
            %HostChecksHealthChanged{host_id: host_id, checks_health: Health.passing()}
          ],
          expected_health: Health.critical()
        },
        %{
          initial_health: Health.passing(),
          initial_heartbeat: {:heartbeat_failed, :critical},
          initial_checks_health: Health.warning(),
          current_checks_health: Health.warning(),
          expected_events: [
            %HostHealthChanged{host_id: host_id, health: Health.critical()}
          ],
          expected_health: Health.critical()
        }
      ]

      host_registered_event = build(:host_registered_event, host_id: host_id)

      for %{
            initial_health: initial_health,
            initial_heartbeat: {factory_reference, initial_heartbeat},
            initial_checks_health: initial_checks_health,
            current_checks_health: current_checks_health,
            expected_events: expected_events,
            expected_health: expected_health
          } <- scenarios do
        heartbeat_event = build(factory_reference, host_id: host_id)

        host_checks_health_changed_event =
          build(:host_checks_health_changed,
            host_id: host_id,
            checks_health: initial_checks_health
          )

        host_health_changed_event =
          build(:host_health_changed_event, host_id: host_id, health: initial_health)

        checks_selected_event = %HostChecksSelected{
          host_id: host_id,
          checks: [Faker.UUID.v4()]
        }

        assert_events_and_state(
          [
            host_registered_event,
            heartbeat_event,
            host_health_changed_event,
            host_checks_health_changed_event,
            checks_selected_event
          ],
          CompleteHostChecksExecution.new!(%{
            host_id: host_id,
            health: current_checks_health
          }),
          expected_events,
          fn host ->
            assert %Host{
                     heartbeat: ^initial_heartbeat,
                     checks_health: ^current_checks_health,
                     health: ^expected_health
                   } = host
          end
        )
      end
    end

    test "unknown checks health should not affect aggregated host's health" do
      host_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.Cat.name() end)
      host_registered_event = build(:host_registered_event, host_id: host_id)
      heartbeat_succeded_event = build(:heartbeat_succeded, host_id: host_id)

      host_health_changed_event =
        build(:host_health_changed_event, host_id: host_id, health: Health.warning())

      assert_events_and_state(
        [
          host_registered_event,
          heartbeat_succeded_event,
          host_health_changed_event
        ],
        SelectHostChecks.new!(%{
          host_id: host_id,
          checks: selected_checks
        }),
        [
          %HostChecksSelected{
            host_id: host_id,
            checks: selected_checks
          }
        ],
        fn host ->
          assert %Host{
                   heartbeat: Health.passing(),
                   selected_checks: ^selected_checks,
                   checks_health: Health.unknown(),
                   health: Health.warning()
                 } = host
        end
      )
    end

    test "should not update health when an empty checks selection is saved" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)
      heartbeat_succeded_event = build(:heartbeat_succeded, host_id: host_id)

      checks_selected_event = %HostChecksSelected{
        host_id: host_id,
        checks: [Faker.UUID.v4()]
      }

      host_checks_health_changed_event =
        build(:host_checks_health_changed,
          host_id: host_id,
          checks_health: Health.warning()
        )

      host_health_changed_event =
        build(:host_health_changed_event, host_id: host_id, health: Health.warning())

      assert_events_and_state(
        [
          host_registered_event,
          heartbeat_succeded_event,
          checks_selected_event,
          host_checks_health_changed_event,
          host_health_changed_event
        ],
        SelectHostChecks.new!(%{
          host_id: host_id,
          checks: []
        }),
        [
          %HostChecksSelected{
            host_id: host_id,
            checks: []
          }
        ],
        fn host ->
          assert %Host{
                   heartbeat: Health.passing(),
                   selected_checks: [],
                   checks_health: Health.warning(),
                   health: Health.warning()
                 } = host
        end
      )
    end
  end

  describe "heartbeat" do
    test "should emit a successful heartbeat and health change for a Host that hasn't heartbeated yet" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: Health.passing()
        }),
        [
          %HeartbeatSucceeded{
            host_id: host_id
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.passing()
          }
        ],
        fn state ->
          assert %Host{
                   heartbeat: Health.passing(),
                   health: Health.passing()
                 } = state
        end
      )
    end

    test "should emit a successful heartbeat and health change for a Host previously in critical status" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: Health.passing()
        }),
        [
          %HeartbeatSucceeded{
            host_id: host_id
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.passing()
          }
        ],
        fn state ->
          assert %Host{
                   heartbeat: Health.passing(),
                   health: Health.passing()
                 } = state
        end
      )
    end

    test "should not emit a successful heartbeat nor health change for a Host already in passing status" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatSucceeded{
          host_id: host_id
        }
      ]

      assert_events(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: Health.passing()
        }),
        []
      )
    end

    test "should emit a heartbeat failure and health change for a Host that hasn't heartbeated yet" do
      host_id = Faker.UUID.v4()

      assert_events_and_state(
        build(:host_registered_event, host_id: host_id),
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: Health.critical()
        }),
        [
          %HeartbeatFailed{
            host_id: host_id
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.critical()
          }
        ],
        fn state ->
          assert %Host{
                   heartbeat: Health.critical(),
                   health: Health.critical()
                 } = state
        end
      )
    end

    test "should emit a heartbeat failure and health change for a Host previously in passing status" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      host_health_changed_to_passing_event =
        build(:host_health_changed_event, host_id: host_id, health: Health.passing())

      assert_events_and_state(
        [
          host_registered_event,
          host_health_changed_to_passing_event
        ],
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: Health.critical()
        }),
        [
          %HeartbeatFailed{
            host_id: host_id
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.critical()
          }
        ],
        fn state ->
          assert %Host{
                   heartbeat: Health.critical(),
                   health: Health.critical()
                 } = state
        end
      )
    end

    test "should not emit a heartbeat failure nor health change for a Host already in critical status" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: Health.critical()
        }),
        []
      )
    end
  end

  describe "provider" do
    test "should return an error if the host is not registered" do
      host_id = Faker.UUID.v4()

      assert_error(
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure
        }),
        {:error, :host_not_registered}
      )
    end

    test "should update azure provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            vm_name: "vmhdbdev01",
            data_disk_number: 7,
            location: "westeurope",
            offer: "sles-sap-15-sp3-byos",
            resource_group: "/subscriptions/00000000-0000-0000-0000-000000000000",
            sku: "gen2",
            vm_size: "Standard_E4s_v3",
            admin_username: "cloudadmin"
          }
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure,
          provider_data: %AzureProvider{
            vm_name: "vmhdbdev01",
            data_disk_number: 7,
            location: "westeurope",
            offer: "sles-sap-15-sp3-byos",
            resource_group: "/subscriptions/00000000-0000-0000-0000-000000000000",
            sku: "gen2",
            vm_size: "Standard_E4s_v3",
            admin_username: "cloudadmin"
          }
        },
        fn state ->
          assert %Host{
                   provider_data: %AzureProvider{
                     vm_name: "vmhdbdev01",
                     data_disk_number: 7,
                     location: "westeurope",
                     offer: "sles-sap-15-sp3-byos",
                     resource_group: "/subscriptions/00000000-0000-0000-0000-000000000000",
                     sku: "gen2",
                     vm_size: "Standard_E4s_v3",
                     admin_username: "cloudadmin"
                   }
                 } = state
        end
      )
    end

    test "should update aws provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            account_id: "12345",
            ami_id: "ami-12345",
            availability_zone: "eu-west-1a",
            data_disk_number: 1,
            instance_id: "i-12345",
            instance_type: "t3.micro",
            region: "eu-west-1",
            vpc_id: "vpc-12345"
          }
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure,
          provider_data: %AwsProvider{
            account_id: "12345",
            ami_id: "ami-12345",
            availability_zone: "eu-west-1a",
            data_disk_number: 1,
            instance_id: "i-12345",
            instance_type: "t3.micro",
            region: "eu-west-1",
            vpc_id: "vpc-12345"
          }
        },
        fn state ->
          assert %Host{
                   provider_data: %AwsProvider{
                     account_id: "12345",
                     ami_id: "ami-12345",
                     availability_zone: "eu-west-1a",
                     data_disk_number: 1,
                     instance_id: "i-12345",
                     instance_type: "t3.micro",
                     region: "eu-west-1",
                     vpc_id: "vpc-12345"
                   }
                 } = state
        end
      )
    end

    test "should update gcp provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            disk_number: 4,
            image: "sles-15-sp1-sap-byos-v20220126",
            instance_name: "vmhana01",
            machine_type: "n1-highmem-8",
            network: "network",
            project_id: "123456",
            zone: "europe-west1-b"
          }
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure,
          provider_data: %GcpProvider{
            disk_number: 4,
            image: "sles-15-sp1-sap-byos-v20220126",
            instance_name: "vmhana01",
            machine_type: "n1-highmem-8",
            network: "network",
            project_id: "123456",
            zone: "europe-west1-b"
          }
        },
        fn state ->
          assert %Host{
                   provider_data: %GcpProvider{
                     disk_number: 4,
                     image: "sles-15-sp1-sap-byos-v20220126",
                     instance_name: "vmhana01",
                     machine_type: "n1-highmem-8",
                     network: "network",
                     project_id: "123456",
                     zone: "europe-west1-b"
                   }
                 } = state
        end
      )
    end

    test "should not update provider if the same provider is registered" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %ProviderUpdated{host_id: host_id, provider: :azure}
      ]

      assert_events(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure
        }),
        []
      )
    end
  end

  describe "sles subscriptions" do
    test "should update" do
      host_id = Faker.UUID.v4()
      identifier = Faker.StarWars.planet()
      version = Faker.StarWars.character()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      subscription_data = %{
        host_id: host_id,
        identifier: identifier,
        version: version,
        arch: "x86_64",
        status: "active"
      }

      assert_events_and_state(
        host_registered_event,
        UpdateSlesSubscriptions.new!(%{
          host_id: host_id,
          subscriptions: [subscription_data]
        }),
        %SlesSubscriptionsUpdated{
          host_id: host_id,
          subscriptions: [SlesSubscription.new!(subscription_data)]
        },
        fn state ->
          assert %Host{
                   subscriptions: [
                     %SlesSubscription{
                       host_id: ^host_id,
                       identifier: ^identifier,
                       version: ^version,
                       arch: "x86_64",
                       status: "active"
                     }
                   ]
                 } = state
        end
      )
    end
  end

  describe "saptune" do
    test "should remove saptune status when saptune is uninstalled" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:saptune_status_updated_event, host_id: host_id),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.passing()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: false,
          package_version: nil,
          sap_running: false,
          status: nil
        }),
        %SaptuneStatusUpdated{
          host_id: host_id,
          status: nil
        },
        fn state ->
          assert %Host{
                   saptune_status: nil
                 } = state
        end
      )
    end

    test "should update saptune version when status data is empty" do
      host_id = Faker.UUID.v4()
      new_saptune_version = Faker.App.semver()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:saptune_status_updated_event, host_id: host_id),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.passing()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: true,
          package_version: new_saptune_version,
          sap_running: false,
          status: nil
        }),
        %SaptuneStatusUpdated{
          host_id: host_id,
          status: %SaptuneStatus{
            package_version: new_saptune_version
          }
        },
        fn %Host{
             saptune_status: saptune_status
           } ->
          assert saptune_status ==
                   %SaptuneStatus{
                     package_version: new_saptune_version
                   }
        end
      )
    end

    test "should update saptune status" do
      host_id = Faker.UUID.v4()
      saptune_status = build(:saptune_status, package_version: "3.1.0")
      new_saptune_status = build(:saptune_status, package_version: "3.2.0")

      initial_events = [
        build(:host_registered_event),
        build(:saptune_status_updated_event, host_id: host_id, status: saptune_status),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.passing()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: true,
          package_version: "3.2.0",
          sap_running: false,
          status: StructHelper.to_atomized_map(new_saptune_status)
        }),
        %SaptuneStatusUpdated{
          host_id: host_id,
          status: new_saptune_status
        },
        fn state ->
          assert %Host{
                   saptune_status: ^new_saptune_status
                 } = state
        end
      )
    end

    test "should not update saptune status if it contains the same data" do
      host_id = Faker.UUID.v4()
      saptune_status = build(:saptune_status)

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:saptune_status_updated_event, host_id: host_id, status: saptune_status),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.passing()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: true,
          package_version: Faker.App.semver(),
          sap_running: false,
          status: StructHelper.to_atomized_map(saptune_status)
        }),
        [],
        fn state ->
          assert %Host{
                   saptune_status: ^saptune_status
                 } = state
        end
      )
    end

    test "should update saptune health to passing when a SAP workload is removed and saptune is not installed" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:heartbeat_succeded, host_id: host_id),
        build(:saptune_status_updated_event, host_id: host_id),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.warning()
        ),
        build(:host_health_changed_event,
          host_id: host_id,
          health: Health.warning()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: false,
          package_version: nil,
          sap_running: false,
          status: nil
        }),
        [
          %SaptuneStatusUpdated{
            host_id: host_id,
            status: nil
          },
          %HostSaptuneHealthChanged{
            host_id: host_id,
            saptune_health: Health.passing()
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.passing()
          }
        ],
        fn state ->
          assert %Host{
                   saptune_status: nil,
                   saptune_health: Health.passing(),
                   health: Health.passing()
                 } = state
        end
      )
    end

    test "should update saptune health to warning when a SAP workload is found and saptune is not installed" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:heartbeat_succeded, host_id: host_id),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.passing()
        ),
        build(:host_health_changed_event,
          host_id: host_id,
          health: Health.passing()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: false,
          package_version: nil,
          sap_running: true,
          status: nil
        }),
        [
          %HostSaptuneHealthChanged{
            host_id: host_id,
            saptune_health: Health.warning()
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.warning()
          }
        ],
        fn state ->
          assert %Host{
                   saptune_status: nil,
                   saptune_health: Health.warning(),
                   health: Health.warning()
                 } = state
        end
      )
    end

    test "should update host health to warning when saptune version is not supported" do
      host_id = Faker.UUID.v4()
      unsupported_version = "3.0.0"

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:heartbeat_succeded, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: true,
          package_version: unsupported_version,
          sap_running: true,
          status: nil
        }),
        [
          %SaptuneStatusUpdated{
            host_id: host_id,
            status: %SaptuneStatus{
              package_version: unsupported_version
            }
          },
          %HostSaptuneHealthChanged{
            host_id: host_id,
            saptune_health: Health.warning()
          },
          %HostHealthChanged{
            host_id: host_id,
            health: Health.warning()
          }
        ],
        fn state ->
          assert %Host{
                   saptune_status: %SaptuneStatus{
                     package_version: ^unsupported_version
                   },
                   saptune_health: Health.warning(),
                   health: Health.warning()
                 } = state
        end
      )
    end

    test "should update host health correctly according the received tuning state" do
      scenarios = [
        {"not compliant", Health.critical()},
        {"not tuned", Health.warning()},
        {"compliant", Health.passing()}
      ]

      for {tuning_state, health} <- scenarios do
        host_id = Faker.UUID.v4()
        suppported_version = "3.1.0"

        saptune_status =
          build(:saptune_status, package_version: "3.1.0", tuning_state: tuning_state)

        initial_events = [
          build(:host_registered_event, host_id: host_id),
          build(:heartbeat_succeded, host_id: host_id)
        ]

        assert_events_and_state(
          initial_events,
          UpdateSaptuneStatus.new!(%{
            host_id: host_id,
            saptune_installed: true,
            package_version: suppported_version,
            sap_running: true,
            status: StructHelper.to_atomized_map(saptune_status)
          }),
          [
            %SaptuneStatusUpdated{
              host_id: host_id,
              status: saptune_status
            },
            %HostSaptuneHealthChanged{
              host_id: host_id,
              saptune_health: health
            },
            %HostHealthChanged{
              host_id: host_id,
              health: health
            }
          ],
          fn state ->
            assert %Host{
                     saptune_status: ^saptune_status,
                     health: ^health,
                     saptune_health: ^health
                   } = state
          end
        )
      end
    end

    test "should not update host health if the current health has the same value" do
      host_id = Faker.UUID.v4()
      unsupported_version = "3.0.0"

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:heartbeat_succeded, host_id: host_id),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.warning()
        ),
        build(:host_health_changed_event, host_id: host_id, health: Health.warning())
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: true,
          package_version: unsupported_version,
          sap_running: true,
          status: nil
        }),
        [
          %SaptuneStatusUpdated{
            host_id: host_id,
            status: %SaptuneStatus{
              package_version: unsupported_version
            }
          }
        ],
        fn state ->
          assert %Host{
                   saptune_status: %SaptuneStatus{
                     package_version: ^unsupported_version
                   },
                   health: Health.warning(),
                   saptune_health: Health.warning()
                 } = state
        end
      )
    end

    test "should not update saptune status or health if the coming data is the same" do
      host_id = Faker.UUID.v4()
      unsupported_version = "3.0.0"

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:heartbeat_succeded, host_id: host_id),
        build(:saptune_status_updated_event,
          host_id: host_id,
          status: %SaptuneStatus{package_version: unsupported_version}
        ),
        build(:host_saptune_health_changed_event,
          host_id: host_id,
          saptune_health: Health.warning()
        ),
        build(:host_health_changed_event,
          host_id: host_id,
          health: Health.warning()
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateSaptuneStatus.new!(%{
          host_id: host_id,
          saptune_installed: true,
          package_version: unsupported_version,
          sap_running: true,
          status: nil
        }),
        [],
        fn state ->
          assert %Host{
                   saptune_status: %SaptuneStatus{
                     package_version: ^unsupported_version
                   },
                   saptune_health: Health.warning(),
                   health: Health.warning()
                 } = state
        end
      )
    end
  end

  describe "software updates discovery" do
    test "should not accept software updates discovery commands if a host is not registered yet" do
      commands = [
        %CompleteSoftwareUpdatesDiscovery{host_id: Faker.UUID.v4()},
        %ClearSoftwareUpdatesDiscovery{host_id: Faker.UUID.v4()}
      ]

      for command <- commands do
        assert_error(command, {:error, :host_not_registered})
      end
    end

    defp get_host_health_changed_event(host_id, scenario) do
      case Map.get(scenario, :expect_host_health_changed, true) do
        true ->
          build_list(1, :host_health_changed_event,
            host_id: host_id,
            health: Map.get(scenario, :expected_host_health)
          )

        false ->
          []
      end
    end

    test "should handle host's health change based on software updates discovery" do
      host_id = Faker.UUID.v4()

      scenarios = [
        %{
          initial_host_health: Health.passing(),
          software_updates_discovery_health: SoftwareUpdatesHealth.critical(),
          expected_host_health: Health.critical()
        },
        %{
          initial_host_health: Health.passing(),
          software_updates_discovery_health: SoftwareUpdatesHealth.warning(),
          expected_host_health: Health.warning()
        },
        %{
          initial_host_health: Health.passing(),
          software_updates_discovery_health: SoftwareUpdatesHealth.passing(),
          expect_host_health_changed: false,
          expected_host_health: Health.passing()
        },
        %{
          initial_host_health: Health.warning(),
          software_updates_discovery_health: SoftwareUpdatesHealth.critical(),
          expected_host_health: Health.critical()
        },
        %{
          initial_host_health: Health.warning(),
          software_updates_discovery_health: SoftwareUpdatesHealth.passing(),
          expected_host_health: Health.passing()
        },
        %{
          initial_host_health: Health.warning(),
          software_updates_discovery_health: SoftwareUpdatesHealth.warning(),
          expect_host_health_changed: false,
          expected_host_health: Health.warning()
        },
        %{
          initial_host_health: Health.critical(),
          initial_heartbeat: :heartbeat_failed,
          software_updates_discovery_health: SoftwareUpdatesHealth.warning(),
          expect_host_health_changed: false,
          expected_host_health: Health.critical()
        },
        %{
          initial_host_health: Health.critical(),
          software_updates_discovery_health: SoftwareUpdatesHealth.critical(),
          expect_host_health_changed: false,
          expected_host_health: Health.critical()
        },
        %{
          initial_host_health: Health.critical(),
          software_updates_discovery_health: SoftwareUpdatesHealth.warning(),
          expected_host_health: Health.warning()
        },
        %{
          initial_host_health: Health.critical(),
          software_updates_discovery_health: SoftwareUpdatesHealth.passing(),
          expected_host_health: Health.passing()
        },
        %{
          initial_host_health: Health.passing(),
          software_updates_discovery_health: SoftwareUpdatesHealth.unknown(),
          expected_host_health: Health.unknown()
        },
        %{
          initial_host_health: Health.critical(),
          initial_heartbeat: :heartbeat_failed,
          software_updates_discovery_health: SoftwareUpdatesHealth.unknown(),
          expected_host_health: Health.unknown()
        },
        %{
          initial_host_health: Health.unknown(),
          initial_heartbeat: :heartbeat_failed,
          software_updates_discovery_health: SoftwareUpdatesHealth.unknown(),
          expect_host_health_changed: false,
          expected_host_health: Health.unknown()
        }
      ]

      for %{
            initial_host_health: initial_host_health,
            software_updates_discovery_health: software_updates_discovery_health,
            expected_host_health: expected_host_health
          } = scenario <- scenarios do
        heartbeat_factory_reference = Map.get(scenario, :initial_heartbeat, :heartbeat_succeded)

        initial_events = [
          build(:host_registered_event, host_id: host_id),
          build(heartbeat_factory_reference, host_id: host_id),
          build(:host_health_changed_event, host_id: host_id, health: initial_host_health)
        ]

        assert_events_and_state(
          initial_events,
          CompleteSoftwareUpdatesDiscovery.new!(%{
            host_id: host_id,
            health: software_updates_discovery_health
          }),
          [
            %SoftwareUpdatesHealthChanged{
              host_id: host_id,
              health: software_updates_discovery_health
            }
          ] ++ get_host_health_changed_event(host_id, scenario),
          fn host ->
            assert %Host{
                     health: ^expected_host_health,
                     software_updates_discovery_health: ^software_updates_discovery_health
                   } = host
          end
        )
      end
    end

    test "should not emit software updates health change when newly discovered software updates health does not change" do
      unchanging_software_updates_discovery_health = [
        SoftwareUpdatesHealth.critical(),
        SoftwareUpdatesHealth.warning(),
        SoftwareUpdatesHealth.passing()
      ]

      for unchanged_software_updates_discovery_health <-
            unchanging_software_updates_discovery_health do
        host_id = Faker.UUID.v4()

        initial_events = [
          build(:host_registered_event, host_id: host_id),
          build(:software_updates_discovery_health_changed_event,
            host_id: host_id,
            health: unchanged_software_updates_discovery_health
          )
        ]

        assert_events_and_state(
          initial_events,
          CompleteSoftwareUpdatesDiscovery.new!(%{
            host_id: host_id,
            health: unchanged_software_updates_discovery_health
          }),
          [],
          fn host ->
            assert %Host{
                     software_updates_discovery_health:
                       ^unchanged_software_updates_discovery_health
                   } = host
          end
        )
      end
    end

    test "should ignore clearing software updates discovery when there is nothing to clear up" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        build(:heartbeat_succeded, host_id: host_id),
        build(:host_health_changed_event, host_id: host_id, health: Health.passing())
      ]

      assert_events_and_state(
        initial_events,
        ClearSoftwareUpdatesDiscovery.new!(%{host_id: host_id}),
        [],
        fn host ->
          assert %Host{
                   health: Health.passing(),
                   software_updates_discovery_health: SoftwareUpdatesHealth.not_set()
                 } = host
        end
      )
    end

    test "should clear software updates discovery result" do
      host_id = Faker.UUID.v4()

      scenarios = [
        %{
          initial_host_health: Health.critical(),
          initial_software_updates_discovery_health: SoftwareUpdatesHealth.critical(),
          expected_host_health: Health.passing()
        },
        %{
          initial_host_health: Health.critical(),
          initial_heartbeat: :heartbeat_failed,
          initial_software_updates_discovery_health: SoftwareUpdatesHealth.warning(),
          expect_host_health_changed: false,
          expected_host_health: Health.critical()
        },
        %{
          initial_host_health: Health.warning(),
          initial_software_updates_discovery_health: SoftwareUpdatesHealth.warning(),
          expected_host_health: Health.passing()
        }
      ]

      for %{
            initial_host_health: initial_host_health,
            initial_software_updates_discovery_health: initial_software_updates_discovery_health,
            expected_host_health: expected_host_health
          } = scenario <- scenarios do
        heartbeat_factory_reference = Map.get(scenario, :initial_heartbeat, :heartbeat_succeded)

        initial_events = [
          build(:host_registered_event, host_id: host_id),
          build(heartbeat_factory_reference, host_id: host_id),
          build(:software_updates_discovery_health_changed_event,
            host_id: host_id,
            health: initial_software_updates_discovery_health
          ),
          build(:host_health_changed_event, host_id: host_id, health: initial_host_health)
        ]

        assert_events_and_state(
          initial_events,
          ClearSoftwareUpdatesDiscovery.new!(%{host_id: host_id}),
          [
            %SoftwareUpdatesDiscoveryCleared{host_id: host_id}
          ] ++ get_host_health_changed_event(host_id, scenario),
          fn host ->
            assert %Host{
                     health: ^expected_host_health,
                     software_updates_discovery_health: SoftwareUpdatesHealth.not_set()
                   } = host
          end
        )
      end
    end
  end

  describe "rollup" do
    test "should not accept a rollup command if a host was not registered yet" do
      assert_error(
        RollUpHost.new!(%{host_id: Faker.UUID.v4()}),
        {:error, :host_not_registered}
      )
    end

    test "should change the host state to rolling up" do
      host_id = UUID.uuid4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        RollUpHost.new!(%{host_id: host_id}),
        %HostRollUpRequested{
          host_id: host_id,
          snapshot: %Host{
            host_id: host_registered_event.host_id,
            hostname: host_registered_event.hostname,
            fully_qualified_domain_name: host_registered_event.fully_qualified_domain_name,
            ip_addresses: host_registered_event.ip_addresses,
            agent_version: host_registered_event.agent_version,
            cpu_count: host_registered_event.cpu_count,
            total_memory_mb: host_registered_event.total_memory_mb,
            socket_count: host_registered_event.socket_count,
            os_version: host_registered_event.os_version,
            arch: host_registered_event.arch,
            installation_source: host_registered_event.installation_source,
            prometheus_targets: host_registered_event.prometheus_targets,
            heartbeat: :unknown,
            rolling_up: false
          }
        },
        fn %Host{rolling_up: rolling_up} ->
          assert rolling_up
        end
      )
    end

    test "should not accept commands if a host is in rolling up state" do
      host_id = UUID.uuid4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      events = [
        host_registered_event,
        %HostRollUpRequested{
          host_id: host_id,
          snapshot: %Host{}
        }
      ]

      commands_to_reject = [
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            account_id: "12345",
            ami_id: "ami-12345",
            availability_zone: "eu-west-1a",
            data_disk_number: 1,
            instance_id: "i-12345",
            instance_type: "t3.micro",
            region: "eu-west-1",
            vpc_id: "vpc-12345"
          }
        }),
        RollUpHost.new!(%{
          host_id: host_id
        })
      ]

      for command <- commands_to_reject do
        assert_error(events, command, {:error, :host_rolling_up})
      end
    end

    test "should apply the rollup event and rehydrate the aggregate" do
      host_id = UUID.uuid4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_state(
        [
          host_registered_event,
          %HostRolledUp{
            host_id: host_id,
            snapshot: %Host{
              host_id: host_registered_event.host_id,
              hostname: host_registered_event.hostname,
              fully_qualified_domain_name: host_registered_event.fully_qualified_domain_name,
              ip_addresses: host_registered_event.ip_addresses,
              agent_version: host_registered_event.agent_version,
              cpu_count: host_registered_event.cpu_count,
              total_memory_mb: host_registered_event.total_memory_mb,
              socket_count: host_registered_event.socket_count,
              os_version: host_registered_event.os_version,
              arch: host_registered_event.arch,
              installation_source: host_registered_event.installation_source,
              heartbeat: :unknown,
              rolling_up: false
            }
          }
        ],
        [],
        fn host ->
          refute host.rolling_up
          assert host.host_id == host_registered_event.host_id
          assert host.hostname == host_registered_event.hostname

          assert host.fully_qualified_domain_name ==
                   host_registered_event.fully_qualified_domain_name

          assert host.ip_addresses == host_registered_event.ip_addresses
          assert host.agent_version == host_registered_event.agent_version
          assert host.cpu_count == host_registered_event.cpu_count
          assert host.total_memory_mb == host_registered_event.total_memory_mb
          assert host.socket_count == host_registered_event.socket_count
          assert host.os_version == host_registered_event.os_version
          assert host.arch == host_registered_event.arch
          assert host.installation_source == host_registered_event.installation_source
          assert host.heartbeat == :unknown
        end
      )
    end
  end

  describe "deregistration" do
    test "should restore a deregistered host when a RegisterHost command with no new host information is received" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event =
          build(:host_registered_event, host_id: host_id, fully_qualified_domain_name: nil),
        %HostDeregistered{
          host_id: host_id,
          deregistered_at: DateTime.utc_now()
        }
      ]

      restoration_command =
        build(
          :register_host_command,
          host_id: host_id,
          hostname: host_registered_event.hostname,
          fully_qualified_domain_name: host_registered_event.fully_qualified_domain_name,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          cpu_count: host_registered_event.cpu_count,
          total_memory_mb: host_registered_event.total_memory_mb,
          socket_count: host_registered_event.socket_count,
          os_version: host_registered_event.os_version,
          arch: host_registered_event.arch,
          installation_source: host_registered_event.installation_source,
          prometheus_targets: host_registered_event.prometheus_targets
        )

      assert_events_and_state(
        initial_events,
        [
          restoration_command
        ],
        [
          %HostRestored{host_id: host_id}
        ],
        fn host ->
          assert nil == host.deregistered_at
        end
      )
    end

    test "should restore and update a deregistered host when a RegisterHost command with new host information is received" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id, fully_qualified_domain_name: nil),
        %HostDeregistered{
          host_id: host_id,
          deregistered_at: DateTime.utc_now()
        }
      ]

      restoration_command =
        build(:register_host_command, host_id: host_id, fully_qualified_domain_name: nil)

      assert_events_and_state(
        initial_events,
        [
          restoration_command
        ],
        [
          %HostRestored{host_id: host_id},
          %HostDetailsUpdated{
            host_id: restoration_command.host_id,
            hostname: restoration_command.hostname,
            ip_addresses: restoration_command.ip_addresses,
            agent_version: restoration_command.agent_version,
            cpu_count: restoration_command.cpu_count,
            total_memory_mb: restoration_command.total_memory_mb,
            socket_count: restoration_command.socket_count,
            os_version: restoration_command.os_version,
            arch: restoration_command.arch,
            installation_source: restoration_command.installation_source,
            fully_qualified_domain_name: restoration_command.fully_qualified_domain_name,
            prometheus_targets: restoration_command.prometheus_targets
          }
        ],
        fn host ->
          assert nil == host.deregistered_at
        end
      )
    end

    test "should restore a deregistered host when no new host information is received and trigger software updates discovery if the restored host has an FQDN" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event = build(:host_registered_event, host_id: host_id),
        %HostDeregistered{
          host_id: host_id,
          deregistered_at: DateTime.utc_now()
        }
      ]

      restoration_command =
        build(
          :register_host_command,
          host_id: host_id,
          hostname: host_registered_event.hostname,
          fully_qualified_domain_name: host_registered_event.fully_qualified_domain_name,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          cpu_count: host_registered_event.cpu_count,
          total_memory_mb: host_registered_event.total_memory_mb,
          socket_count: host_registered_event.socket_count,
          os_version: host_registered_event.os_version,
          arch: host_registered_event.arch,
          installation_source: host_registered_event.installation_source,
          prometheus_targets: host_registered_event.prometheus_targets
        )

      assert_events_and_state(
        initial_events,
        [
          restoration_command
        ],
        [
          %HostRestored{host_id: host_id},
          %SoftwareUpdatesDiscoveryRequested{
            host_id: host_id,
            fully_qualified_domain_name: host_registered_event.fully_qualified_domain_name
          }
        ],
        fn host ->
          assert nil == host.deregistered_at
        end
      )
    end

    test "should restore, update and trigger software updates discovery for a deregistered host when FQDN changed" do
      scenarios = [
        %{
          initial_fqdn: Faker.Internet.domain_name(),
          new_fqdn: Faker.Internet.ip_v4_address()
        },
        %{
          initial_fqdn: nil,
          new_fqdn: Faker.Internet.domain_name()
        }
      ]

      for %{initial_fqdn: initial_fqdn, new_fqdn: new_fqdn} <- scenarios do
        host_id = Faker.UUID.v4()

        initial_events = [
          build(:host_registered_event,
            host_id: host_id,
            fully_qualified_domain_name: initial_fqdn
          ),
          %HostDeregistered{
            host_id: host_id,
            deregistered_at: DateTime.utc_now()
          }
        ]

        restoration_command =
          build(:register_host_command, host_id: host_id, fully_qualified_domain_name: new_fqdn)

        assert_events_and_state(
          initial_events,
          [
            restoration_command
          ],
          [
            %HostRestored{host_id: host_id},
            %HostDetailsUpdated{
              host_id: restoration_command.host_id,
              hostname: restoration_command.hostname,
              ip_addresses: restoration_command.ip_addresses,
              agent_version: restoration_command.agent_version,
              cpu_count: restoration_command.cpu_count,
              total_memory_mb: restoration_command.total_memory_mb,
              socket_count: restoration_command.socket_count,
              os_version: restoration_command.os_version,
              arch: restoration_command.arch,
              installation_source: restoration_command.installation_source,
              fully_qualified_domain_name: restoration_command.fully_qualified_domain_name,
              prometheus_targets: restoration_command.prometheus_targets
            },
            %SoftwareUpdatesDiscoveryRequested{
              host_id: host_id,
              fully_qualified_domain_name: new_fqdn
            }
          ],
          fn host ->
            assert nil == host.deregistered_at
          end
        )
      end
    end

    test "should restore and update a deregistered host but not trigger software updates discovery when FQDN stays null or gets nullified" do
      scenarios = [
        %{
          initial_fqdn: nil,
          new_fqdn: nil
        },
        %{
          initial_fqdn: Faker.Internet.domain_name(),
          new_fqdn: nil
        }
      ]

      for %{initial_fqdn: initial_fqdn, new_fqdn: new_fqdn} <- scenarios do
        host_id = Faker.UUID.v4()

        initial_events = [
          build(:host_registered_event,
            host_id: host_id,
            fully_qualified_domain_name: initial_fqdn
          ),
          %HostDeregistered{
            host_id: host_id,
            deregistered_at: DateTime.utc_now()
          }
        ]

        restoration_command =
          build(:register_host_command, host_id: host_id, fully_qualified_domain_name: new_fqdn)

        assert_events_and_state(
          initial_events,
          [
            restoration_command
          ],
          [
            %HostRestored{host_id: host_id},
            %HostDetailsUpdated{
              host_id: restoration_command.host_id,
              hostname: restoration_command.hostname,
              ip_addresses: restoration_command.ip_addresses,
              agent_version: restoration_command.agent_version,
              cpu_count: restoration_command.cpu_count,
              total_memory_mb: restoration_command.total_memory_mb,
              socket_count: restoration_command.socket_count,
              os_version: restoration_command.os_version,
              arch: restoration_command.arch,
              installation_source: restoration_command.installation_source,
              fully_qualified_domain_name: restoration_command.fully_qualified_domain_name,
              prometheus_targets: restoration_command.prometheus_targets
            }
          ],
          fn host ->
            assert nil == host.deregistered_at
          end
        )
      end
    end

    test "should clear up software updates discoveries on deregistration" do
      host_id = Faker.UUID.v4()
      deregistered_at = DateTime.utc_now()

      assert_state(
        [
          build(:host_registered_event, host_id: host_id),
          build(:software_updates_discovery_health_changed_event,
            host_id: host_id,
            health: SoftwareUpdatesHealth.critical()
          )
        ],
        %DeregisterHost{
          host_id: host_id,
          deregistered_at: deregistered_at
        },
        fn host ->
          assert %Host{
                   software_updates_discovery_health: SoftwareUpdatesHealth.not_set(),
                   deregistered_at: ^deregistered_at
                 } = host
        end
      )
    end

    test "should reject all the commands except the registration ones when the host is deregistered" do
      host_id = Faker.UUID.v4()
      dat = DateTime.utc_now()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HostDeregistered{
          host_id: host_id,
          deregistered_at: dat
        }
      ]

      commands_to_reject = [
        %DeregisterHost{host_id: host_id},
        %RequestHostDeregistration{host_id: host_id},
        %UpdateHeartbeat{host_id: host_id},
        %UpdateProvider{host_id: host_id},
        %UpdateSlesSubscriptions{host_id: host_id},
        %CompleteSoftwareUpdatesDiscovery{host_id: host_id},
        %ClearSoftwareUpdatesDiscovery{host_id: host_id},
        %SelectHostChecks{host_id: host_id}
      ]

      for command <- commands_to_reject do
        assert_error(initial_events, command, {:error, :host_not_registered})
      end

      commands_to_accept = [
        %RollUpHost{host_id: host_id},
        %RegisterHost{host_id: host_id}
      ]

      for command <- commands_to_accept do
        assert match?({:ok, _, _}, aggregate_run(initial_events, command)),
               "Command #{inspect(command)} should be accepted by a deregistered host"
      end
    end

    test "should emit relevant events when deregistering a host" do
      host_id = Faker.UUID.v4()
      dat = DateTime.utc_now()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events(
        [host_registered_event],
        [
          %DeregisterHost{
            host_id: host_id,
            deregistered_at: dat
          }
        ],
        [
          %SoftwareUpdatesDiscoveryCleared{
            host_id: host_id
          },
          %HostDeregistered{
            host_id: host_id,
            deregistered_at: dat
          },
          %HostTombstoned{
            host_id: host_id
          }
        ]
      )
    end

    test "should emit the HostDeregistrationRequest Event" do
      host_id = Faker.UUID.v4()
      requested_at = DateTime.utc_now()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events(
        [host_registered_event],
        [
          %RequestHostDeregistration{
            host_id: host_id,
            requested_at: requested_at
          }
        ],
        %HostDeregistrationRequested{
          host_id: host_id,
          requested_at: requested_at
        }
      )
    end

    test "should apply the HostDeregistered event and set the deregistration date into the state" do
      host_id = Faker.UUID.v4()
      dat = DateTime.utc_now()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_state(
        [
          host_registered_event,
          %HostDeregistered{
            host_id: host_id,
            deregistered_at: dat
          }
        ],
        [],
        fn host ->
          assert dat == host.deregistered_at
        end
      )
    end
  end
end
