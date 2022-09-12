defmodule Trento.Domain.Events.HostDetailsUpdatedTest do
  use Trento.AggregateCase, aggregate: Trento.Domain.Host, async: true

  alias Trento.Domain.Events.HostDetailsUpdated

  describe "HostDetailsUpdated event upcasting" do
    test "should upcast HostDetailsUpdated event properly from version 1" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      ssh_address = Faker.Internet.ip_v4_address()
      agent_version = Faker.Internet.slug()
      cpu_count = Enum.random(1..16)
      total_memory_mb = Enum.random(1..128)
      socket_count = Enum.random(1..16)
      os_version = Faker.App.version()

      assert %HostDetailsUpdated{
               version: 2,
               host_id: host_id,
               hostname: hostname,
               ip_addresses: ip_addresses,
               ssh_address: ssh_address,
               agent_version: agent_version,
               cpu_count: cpu_count,
               total_memory_mb: total_memory_mb,
               socket_count: socket_count,
               os_version: os_version,
               installation_source: :unknown
             } ==
               %{
                 "host_id" => host_id,
                 "hostname" => hostname,
                 "ip_addresses" => ip_addresses,
                 "ssh_address" => ssh_address,
                 "agent_version" => agent_version,
                 "cpu_count" => cpu_count,
                 "total_memory_mb" => total_memory_mb,
                 "socket_count" => socket_count,
                 "os_version" => os_version
               }
               |> HostDetailsUpdated.upcast(%{})
               |> HostDetailsUpdated.new!()
    end
  end
end
