defmodule Tronto.Monitoring.ClusterProjectorTest do
  use ExUnit.Case
  use Tronto.DataCase

  alias Tronto.Monitoring.{
    ClusterProjector,
    ClusterReadModel
  }

  alias Tronto.Monitoring.Domain.Events.{
    ClusterDetailsUpdated,
    ClusterRegistered
  }

  alias Tronto.ProjectorTestHelper
  alias Tronto.Repo

  @moduletag :integration

  test "should project a new cluster when ClusterRegistered event is received" do
    event = %ClusterRegistered{
      id_cluster: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      type: :hana_scale_up
    }

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
    cluster_projection = Repo.get!(ClusterReadModel, event.id_cluster)

    assert event.id_cluster == cluster_projection.id
    assert event.name == cluster_projection.name
    assert event.sid == cluster_projection.sid
    assert event.type == cluster_projection.type
  end

  test "should update the cluster details when ClusterDetailsUpdated is received" do
    id_cluster = Faker.UUID.v4()

    cluster_registered_event = %ClusterRegistered{
      id_cluster: id_cluster,
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      type: :hana_scale_up
    }

    ProjectorTestHelper.project(ClusterProjector, cluster_registered_event, "cluster_projector")

    cluster_details_updated_event = %ClusterDetailsUpdated{
      id_cluster: id_cluster,
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      type: :hana_scale_up
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      cluster_details_updated_event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, id_cluster)

    assert cluster_details_updated_event.id_cluster == cluster_projection.id
    assert cluster_details_updated_event.name == cluster_projection.name
    assert cluster_details_updated_event.sid == cluster_projection.sid
    assert cluster_details_updated_event.type == cluster_projection.type
  end
end
