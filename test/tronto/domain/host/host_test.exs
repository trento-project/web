defmodule Tronto.Monitoring.HostTest do
  use Commanded.AggregateCase, aggregate: Tronto.Monitoring.Domain.Host, async: true

  alias Tronto.Monitoring.Domain.Host
  alias Tronto.Monitoring.Domain.Commands.RegisterHost
  alias Tronto.Monitoring.Domain.Events.HostRegistered

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
          agent_version: agent_version
        }
      )

      assert_state(
        commands,
        %Host{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      )
    end

    test "should not register a host if it is already registered" do
      id_host = Faker.UUID.v4()

      assert_events(
        [
          %HostRegistered{
            id_host: id_host,
            hostname: Faker.StarWars.character(),
            ip_addresses: [Faker.Internet.ip_v4_address()],
            agent_version: Faker.Internet.slug()
          }
        ],
        [
          RegisterHost.new!(
            id_host: id_host,
            hostname: Faker.StarWars.character(),
            ip_addresses: [Faker.Internet.ip_v4_address()],
            agent_version: Faker.Internet.slug()
          )
        ],
        []
      )
    end
  end
end
