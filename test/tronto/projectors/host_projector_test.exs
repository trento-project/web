defmodule Tronto.Monitoring.HostProjectorTest do
  use ExUnit.Case
  use Tronto.DataCase

  alias Tronto.Monitoring.{
    HostProjector,
    HostReadModel
  }

  alias Tronto.Monitoring.Domain.Events.HostRegistered

  alias Tronto.ProjectorTestHelper
  alias Tronto.Repo

  @moduletag :integration

  test "should project a new host when HostRegistered event is received" do
    event = %HostRegistered{
      id_host: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
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
end
