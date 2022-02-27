defmodule Tronto.Factory do
  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HostRegistered
  }

  def host_registered_event(attrs \\ []) do
    %HostRegistered{
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      ip_addresses: Keyword.get(attrs, :ip_addresses, [Faker.Internet.ip_v4_address()]),
      agent_version: Keyword.get(attrs, :agent_version, Faker.App.semver()),
      heartbeat: :unknown
    }
  end
end
