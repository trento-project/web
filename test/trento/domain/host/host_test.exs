defmodule Trento.HostTest do
  use Trento.AggregateCase, aggregate: Trento.Domain.Host, async: true

  import Trento.Factory

  alias Trento.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated,
    SlesSubscriptionsUpdated
  }

  alias Trento.Domain.Host
  alias Trento.Domain.SlesSubscription

  describe "host registration" do
    test "should register a host" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      ssh_address = Faker.Internet.ip_v4_address()
      agent_version = Faker.Internet.slug()
      cpu_count = Enum.random(1..16)
      total_memory_mb = Enum.random(1..128)
      socket_count = Enum.random(1..16)
      os_version = Faker.App.version()

      assert_events_and_state(
        [],
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version
        }),
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          heartbeat: :unknown
        },
        %Host{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          heartbeat: :unknown
        }
      )
    end

    test "should update host details if it is already registered" do
      host_id = Faker.UUID.v4()
      new_hostname = Faker.StarWars.character()
      new_ip_addresses = [Faker.Internet.ip_v4_address()]
      new_ssh_address = Faker.Internet.ip_v4_address()
      new_agent_version = Faker.Internet.slug()
      new_cpu_count = Enum.random(1..16)
      new_total_memory_mb = Enum.random(1..128)
      new_socket_count = Enum.random(1..16)
      new_os_version = Faker.App.version()

      assert_events_and_state(
        host_registered_event(host_id: host_id),
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          ssh_address: new_ssh_address,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version
        }),
        %HostDetailsUpdated{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          ssh_address: new_ssh_address,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version
        },
        %Host{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          ssh_address: new_ssh_address,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          heartbeat: :unknown
        }
      )
    end

    test "should not update host details if the same details were already registered" do
      host_registered_event = host_registered_event()

      assert_events(
        host_registered_event,
        RegisterHost.new!(%{
          host_id: host_registered_event.host_id,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          ssh_address: host_registered_event.ssh_address,
          agent_version: host_registered_event.agent_version,
          cpu_count: host_registered_event.cpu_count,
          total_memory_mb: host_registered_event.total_memory_mb,
          socket_count: host_registered_event.socket_count,
          os_version: host_registered_event.os_version
        }),
        []
      )
    end
  end

  describe "heartbeat" do
    test "should emit an HeartbeatSucceded event if the Host never received an heartbeat already" do
      host_id = Faker.UUID.v4()
      host_registered_event = host_registered_event(host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :passing
        }),
        %HeartbeatSucceded{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :passing
                 } = state
        end
      )
    end

    test "should emit an HeartbeatSucceded event if the Host is in a critical status" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event(host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :passing
        }),
        %HeartbeatSucceded{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :passing
                 } = state
        end
      )
    end

    test "should not emit an HeartbeatSucceded event if the Host is in a passing status already" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event(host_id: host_id),
        %HeartbeatSucceded{
          host_id: host_id
        }
      ]

      assert_events(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :passing
        }),
        []
      )
    end

    test "should emit an HeartbeatFailed event if the Host has never received an heartbeat" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event(host_id: host_id),
        %HeartbeatSucceded{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :critical
        }),
        %HeartbeatFailed{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :critical
                 } = state
        end
      )
    end

    test "should emit an HeartbeatFailed event if the Host is in a passing status" do
      host_id = Faker.UUID.v4()
      host_registered_event = host_registered_event(host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :critical
        }),
        %HeartbeatFailed{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :critical
                 } = state
        end
      )
    end

    test "should not emit an HeartbeatFailed event if the Host is in a critical status already" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event(host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :critical
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

    test "should update provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event(host_id: host_id)
      ]

      assert_events(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure
        }
      )
    end

    test "should not update provider if the same provider is registered" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event(host_id: host_id),
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

      host_registered_event = host_registered_event(host_id: host_id)

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
end
