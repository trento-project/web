defmodule Trento.ClusterProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.{
    ClusterProjector,
    ClusterReadModel
  }

  alias Trento.Domain.Events.{
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    ClusterDetailsUpdated
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  alias Trento.Support.StructHelper

  @moduletag :integration

  test "should project a new cluster when ClusterRegistered event is received" do
    event = cluster_registered_event()

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
    cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

    assert event.cluster_id == cluster_projection.id
    assert event.name == cluster_projection.name
    assert event.sid == cluster_projection.sid
    assert StructHelper.to_map(event.details) == cluster_projection.details
    assert event.type == cluster_projection.type
  end

  test "should update the cluster details when ClusterDetailsUpdated is received" do
    cluster_projection(id: cluster_id = Faker.UUID.v4())

    event = %ClusterDetailsUpdated{
      cluster_id: cluster_id,
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      type: :hana_scale_up,
      details: hana_cluster_details_value_object()
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

    assert event.cluster_id == cluster_projection.id
    assert event.name == cluster_projection.name
    assert event.sid == cluster_projection.sid
    assert event.type == cluster_projection.type
    assert StructHelper.to_map(event.details) == cluster_projection.details
  end

  test "should update the cluster checks execution status when ChecksExecutionRequested is received" do
    cluster_projection(id: cluster_id = Faker.UUID.v4())

    event = %ChecksExecutionRequested{
      cluster_id: cluster_id
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

    assert :requested == cluster_projection.checks_execution
  end

  test "should update the cluster checks execution status when ChecksExecutionStarted is received" do
    cluster_projection(id: cluster_id = Faker.UUID.v4())

    event = %ChecksExecutionStarted{
      cluster_id: cluster_id
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

    assert :running == cluster_projection.checks_execution
  end

  test "should update the cluster checks execution status when ChecksExecutionCompleted is received" do
    cluster_projection(id: cluster_id = Faker.UUID.v4())

    event = %ChecksExecutionCompleted{
      cluster_id: cluster_id
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

    assert :not_running == cluster_projection.checks_execution
  end
end
