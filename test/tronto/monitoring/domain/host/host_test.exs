defmodule Tronto.Monitoring.HostTest do
  use Tronto.AggregateCase, aggregate: Tronto.Monitoring.Domain.Host, async: true

  import Tronto.Factory

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated,
    SlesSubscriptionsUpdated
  }

  alias Tronto.Monitoring.Domain.Host
  alias Tronto.Monitoring.Domain.SlesSubscription

  describe "host registration" do
    test "should register a host" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()

      assert_events_and_state(
        [],
        RegisterHost.new!(
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        ),
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: :unknown
        },
        %Host{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: :unknown
        }
      )
    end

    test "should update host details if it is already registered" do
      host_id = Faker.UUID.v4()
      new_hostname = Faker.StarWars.character()
      new_ip_addresses = [Faker.Internet.ip_v4_address()]
      new_agent_version = Faker.Internet.slug()

      assert_events_and_state(
        host_registered_event(host_id: host_id),
        RegisterHost.new!(
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version
        ),
        %HostDetailsUpdated{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version
        },
        %Host{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          heartbeat: :unknown
        }
      )
    end

    test "should not update host details if the same details were already registered" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()

      assert_events(
        host_registered_event(
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        ),
        RegisterHost.new!(
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        ),
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
        UpdateHeartbeat.new!(
          host_id: host_id,
          heartbeat: :passing
        ),
        %HeartbeatSucceded{
          host_id: host_id
        },
        %Host{
          host_id: host_id,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          heartbeat: :passing
        }
      )
    end

    test "should emit an HeartbeatSucceded event if the Host is in a critical status" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event = host_registered_event(host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(
          host_id: host_id,
          heartbeat: :passing
        ),
        %HeartbeatSucceded{
          host_id: host_id
        },
        %Host{
          host_id: host_id,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          heartbeat: :passing
        }
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
        UpdateHeartbeat.new!(
          host_id: host_id,
          heartbeat: :passing
        ),
        []
      )
    end

    test "should emit an HeartbeatFailed event if the Host has never received an heartbeat" do
      host_id = Faker.UUID.v4()

      initial_events = [
        host_registered_event = host_registered_event(host_id: host_id),
        %HeartbeatSucceded{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(
          host_id: host_id,
          heartbeat: :critical
        ),
        %HeartbeatFailed{
          host_id: host_id
        },
        %Host{
          host_id: host_id,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          heartbeat: :critical
        }
      )
    end

    test "should emit an HeartbeatFailed event if the Host is in a passing status" do
      host_id = Faker.UUID.v4()
      host_registered_event = host_registered_event(host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        UpdateHeartbeat.new!(
          host_id: host_id,
          heartbeat: :critical
        ),
        %HeartbeatFailed{
          host_id: host_id
        },
        %Host{
          host_id: host_id,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          heartbeat: :critical
        }
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
        UpdateHeartbeat.new!(
          host_id: host_id,
          heartbeat: :critical
        ),
        []
      )
    end
  end

  describe "provider" do
    test "should return an error if the host is not registered" do
      host_id = Faker.UUID.v4()
      provider = Faker.StarWars.character()

      assert_error(
        UpdateProvider.new!(
          host_id: host_id,
          provider: provider
        ),
        {:error, :host_not_registered}
      )
    end

    test "should update provider" do
      host_id = Faker.UUID.v4()
      provider = Faker.StarWars.character()

      initial_events = [
        host_registered_event(host_id: host_id)
      ]

      assert_events(
        initial_events,
        UpdateProvider.new!(
          host_id: host_id,
          provider: provider
        ),
        %ProviderUpdated{
          host_id: host_id,
          provider: provider
        }
      )
    end

    test "should not update provider if the same provider is registered" do
      host_id = Faker.UUID.v4()
      provider = Faker.StarWars.character()

      initial_events = [
        host_registered_event(host_id: host_id),
        %ProviderUpdated{host_id: host_id, provider: provider}
      ]

      assert_events(
        initial_events,
        UpdateProvider.new!(
          host_id: host_id,
          provider: provider
        ),
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

      subscription =
        SlesSubscription.new!(
          host_id: host_id,
          identifier: identifier,
          version: version,
          arch: "x86_64",
          status: "active"
        )

      assert_events_and_state(
        [host_registered_event],
        UpdateSlesSubscriptions.new!(
          host_id: host_id,
          subscriptions: [subscription]
        ),
        %SlesSubscriptionsUpdated{
          host_id: host_id,
          subscriptions: [subscription]
        },
        %Host{
          host_id: host_id,
          agent_version: host_registered_event.agent_version,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          heartbeat: :unknown,
          subscriptions: [
            %SlesSubscription{
              host_id: host_id,
              identifier: identifier,
              version: version,
              arch: "x86_64",
              status: "active"
            }
          ]
        }
      )
    end
  end
end
