defmodule Tronto.Monitoring.HostTest do
  use Commanded.AggregateCase, aggregate: Tronto.Monitoring.Domain.Host, async: true

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat
  }

  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered
  }

  alias Tronto.Monitoring.Domain.Host

  describe "host registration" do
    test "should register a host" do
      id_host = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()

      commands = [
        RegisterHost.new!(
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        )
      ]

      assert_events(
        commands,
        %HostRegistered{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: :unknown
        }
      )

      assert_state(
        commands,
        %Host{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: :unknown
        }
      )
    end

    test "should update host details if it is already registered" do
      id_host = Faker.UUID.v4()
      new_hostname = Faker.StarWars.character()
      new_ip_addresses = [Faker.Internet.ip_v4_address()]
      new_agent_version = Faker.Internet.slug()

      initial_events = [
        %HostRegistered{
          id_host: Faker.UUID.v4(),
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        }
      ]

      commands = [
        RegisterHost.new!(
          id_host: id_host,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version
        )
      ]

      assert_events(
        initial_events,
        commands,
        [
          %HostDetailsUpdated{
            id_host: id_host,
            hostname: new_hostname,
            ip_addresses: new_ip_addresses,
            agent_version: new_agent_version
          }
        ]
      )

      assert_state(
        initial_events,
        commands,
        %Host{
          id_host: id_host,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          heartbeat: :unknown
        }
      )
    end

    test "should not update host details if the same details were already registered" do
      id_host = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()

      initial_events = [
        %HostRegistered{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: :unknown
        }
      ]

      commands = [
        RegisterHost.new!(
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        )
      ]

      assert_events(
        initial_events,
        commands,
        []
      )
    end
  end

  describe "heartbeat" do
    test "should emit an HeartbeatSucceded event if the Host never received an heartbeat already" do
      id_host = Faker.UUID.v4()

      initial_events = [
        host_registered_event = %HostRegistered{
          id_host: id_host,
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        }
      ]

      commands = [
        UpdateHeartbeat.new!(
          id_host: id_host,
          heartbeat: :passing
        )
      ]

      assert_events(initial_events, commands, [
        %HeartbeatSucceded{
          id_host: id_host
        }
      ])

      assert_state(initial_events, commands, %Host{
        id_host: id_host,
        hostname: host_registered_event.hostname,
        ip_addresses: host_registered_event.ip_addresses,
        agent_version: host_registered_event.agent_version,
        heartbeat: :passing
      })
    end

    test "should emit an HeartbeatSucceded event if the Host is in a critical status" do
      id_host = Faker.UUID.v4()

      initial_events = [
        host_registered_event = %HostRegistered{
          id_host: id_host,
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        },
        %HeartbeatFailed{
          id_host: id_host
        }
      ]

      commands = [
        UpdateHeartbeat.new!(
          id_host: id_host,
          heartbeat: :passing
        )
      ]

      assert_events(initial_events, commands, [
        %HeartbeatSucceded{
          id_host: id_host
        }
      ])

      assert_state(initial_events, commands, %Host{
        id_host: id_host,
        hostname: host_registered_event.hostname,
        ip_addresses: host_registered_event.ip_addresses,
        agent_version: host_registered_event.agent_version,
        heartbeat: :passing
      })
    end

    test "should not emit an HeartbeatSucceded event if the Host is in a passing status already" do
      id_host = Faker.UUID.v4()

      initial_events = [
        %HostRegistered{
          id_host: id_host,
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        },
        %HeartbeatSucceded{
          id_host: id_host
        }
      ]

      commands = [
        UpdateHeartbeat.new!(
          id_host: id_host,
          heartbeat: :passing
        )
      ]

      assert_events(initial_events, commands, [])
    end

    test "should emit an HeartbeatFailed event if the Host has never received an heartbeat" do
      id_host = Faker.UUID.v4()

      initial_events = [
        host_registered_event = %HostRegistered{
          id_host: id_host,
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        },
        %HeartbeatSucceded{
          id_host: id_host
        }
      ]

      commands = [
        UpdateHeartbeat.new!(
          id_host: id_host,
          heartbeat: :critical
        )
      ]

      assert_events(initial_events, commands, [
        %HeartbeatFailed{
          id_host: id_host
        }
      ])

      assert_state(initial_events, commands, %Host{
        id_host: id_host,
        hostname: host_registered_event.hostname,
        ip_addresses: host_registered_event.ip_addresses,
        agent_version: host_registered_event.agent_version,
        heartbeat: :critical
      })
    end

    test "should emit an HeartbeatFailed event if the Host is in a passing status" do
      id_host = Faker.UUID.v4()

      initial_events = [
        host_registered_event = %HostRegistered{
          id_host: id_host,
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        }
      ]

      commands = [
        UpdateHeartbeat.new!(
          id_host: id_host,
          heartbeat: :critical
        )
      ]

      assert_events(initial_events, commands, [
        %HeartbeatFailed{
          id_host: id_host
        }
      ])

      assert_state(initial_events, commands, %Host{
        id_host: id_host,
        hostname: host_registered_event.hostname,
        ip_addresses: host_registered_event.ip_addresses,
        agent_version: host_registered_event.agent_version,
        heartbeat: :critical
      })
    end

    test "should not emit an HeartbeatFailed event if the Host is in a critical status already" do
      id_host = Faker.UUID.v4()

      initial_events = [
        %HostRegistered{
          id_host: id_host,
          hostname: Faker.StarWars.character(),
          ip_addresses: [Faker.Internet.ip_v4_address()],
          agent_version: Faker.Internet.slug(),
          heartbeat: :unknown
        },
        %HeartbeatFailed{
          id_host: id_host
        }
      ]

      commands = [
        UpdateHeartbeat.new!(
          id_host: id_host,
          heartbeat: :critical
        )
      ]

      assert_events(initial_events, commands, [])
    end
  end
end
