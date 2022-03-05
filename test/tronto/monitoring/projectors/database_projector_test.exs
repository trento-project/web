defmodule Tronto.Monitoring.DatabaseProjectorTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Tronto.Factory

  alias Tronto.Monitoring.{
    DatabaseInstanceReadModel,
    DatabaseProjector,
    DatabaseReadModel
  }

  alias Tronto.ProjectorTestHelper
  alias Tronto.Repo

  @moduletag :integration

  test """
  should project a new database and an instance
  when DatabaseInstanceRegistered event is received for the first time
  """ do
    event = database_instance_registered_event()

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")
    database_projection = Repo.get!(DatabaseReadModel, event.sap_system_id)

    database_instance_projection =
      Repo.get_by(DatabaseInstanceReadModel,
        sap_system_id: event.sap_system_id,
        instance_number: event.instance_number,
        host_id: event.host_id
      )

    assert event.sap_system_id == database_projection.id
    assert event.sid == database_projection.sid

    assert event.sap_system_id == database_instance_projection.sap_system_id
    assert event.sid == database_instance_projection.sid
    assert event.tenant == database_instance_projection.tenant
    assert event.instance_number == database_instance_projection.instance_number
    assert event.features == database_instance_projection.features
    assert event.host_id == database_instance_projection.host_id
  end

  test "should project a new database instance when DatabaseInstanceRegistered event is received" do
    database_projection(id: sap_system_id = Faker.UUID.v4())
    event = database_instance_registered_event(sap_system_id: sap_system_id)

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    database_instance_projection =
      Repo.get_by(DatabaseInstanceReadModel,
        sap_system_id: event.sap_system_id,
        instance_number: event.instance_number,
        host_id: event.host_id
      )

    assert event.sap_system_id == database_instance_projection.sap_system_id
    assert event.sid == database_instance_projection.sid
    assert event.tenant == database_instance_projection.tenant
    assert event.instance_number == database_instance_projection.instance_number
    assert event.features == database_instance_projection.features
    assert event.host_id == database_instance_projection.host_id
  end
end
