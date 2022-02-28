defmodule Tronto.Monitoring.ClusterProjectorTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Tronto.Factory

  alias Tronto.Monitoring.{
    ClusterProjector,
    ClusterReadModel
  }

  alias Tronto.Monitoring.Domain.Events.{
    ClusterDetailsUpdated
  }

  alias Tronto.ProjectorTestHelper
  alias Tronto.Repo

  @moduletag :integration

  test "should project a new cluster when ClusterRegistered event is received" do
    event = cluster_registered_event()

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
    cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

    assert event.cluster_id == cluster_projection.id
    assert event.name == cluster_projection.name
    assert event.sid == cluster_projection.sid
    assert event.type == cluster_projection.type
  end

  test "should update the cluster details when ClusterDetailsUpdated is received" do
    cluster_projection(id: cluster_id = Faker.UUID.v4())

    cluster_details_updated_event = %ClusterDetailsUpdated{
      cluster_id: cluster_id,
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      type: :hana_scale_up
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      cluster_details_updated_event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

    assert cluster_details_updated_event.cluster_id == cluster_projection.id
    assert cluster_details_updated_event.name == cluster_projection.name
    assert cluster_details_updated_event.sid == cluster_projection.sid
    assert cluster_details_updated_event.type == cluster_projection.type
  end
end
