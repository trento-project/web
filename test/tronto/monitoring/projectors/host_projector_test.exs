defmodule Tronto.Monitoring.HostProjectorTest do
  use ExUnit.Case
  use Tronto.DataCase

  alias Tronto.Monitoring.{
    HostProjector,
    HostReadModel
  }

  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered
  }

  alias Tronto.ProjectorTestHelper
  alias Tronto.Repo

  @moduletag :integration

  test "should project a new host when HostRegistered event is received" do
    event = %HostRegistered{
      id_host: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      heartbeat: :unknown
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.id_host)

    assert event.id_host == host_projection.id
    assert event.hostname == host_projection.hostname
    assert event.ip_addresses == host_projection.ip_addresses
    assert event.agent_version == host_projection.agent_version
    assert event.heartbeat == host_projection.heartbeat
  end

  test "should update an existing host when HostDetailsUpdated event is received" do
    Repo.insert!(%HostReadModel{
      id: id_host = Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      heartbeat: :unknown
    })

    event = %HostDetailsUpdated{
      id_host: id_host,
      hostname: hostname = Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet()
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.id_host)

    assert event.id_host == host_projection.id
    assert event.hostname == host_projection.hostname
    assert event.ip_addresses == host_projection.ip_addresses
    assert event.agent_version == host_projection.agent_version
  end

  test "should update the heartbeat field to passing status when HeartbeatSucceded is received" do
    Repo.insert!(%HostReadModel{
      id: id_host = Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      heartbeat: :unknown
    })

    event = %HeartbeatSucceded{
      id_host: id_host
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.id_host)

    assert :passing == host_projection.heartbeat
  end

  test "should update the heartbeat field to critical status when HeartbeatFailed is received" do
    Repo.insert!(%HostReadModel{
      id: id_host = Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      heartbeat: :unknown
    })

    event = %HeartbeatFailed{
      id_host: id_host
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.id_host)

    assert :critical == host_projection.heartbeat
  end
end
