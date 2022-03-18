defmodule Trento.SapSystemProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.{
    ApplicationInstanceReadModel,
    SapSystemProjector,
    SapSystemReadModel
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  test "should project a new SAP System when a SAPSystemRegistered event is received" do
    event = sap_system_registered_event()

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")
    projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.sap_system_id == projection.id
    assert event.sid == projection.sid
    assert event.tenant == projection.tenant
    assert event.db_host == projection.db_host
    assert event.health == projection.health
  end

  test "should project a new application instance when ApplicationInstanceRegistered event is received" do
    sap_system_projection(id: sap_system_id = Faker.UUID.v4())
    event = application_instance_registered_event(sap_system_id: sap_system_id)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    projection =
      Repo.get_by(ApplicationInstanceReadModel,
        sap_system_id: event.sap_system_id,
        instance_number: event.instance_number,
        host_id: event.host_id
      )

    assert event.sap_system_id == projection.sap_system_id
    assert event.sid == projection.sid
    assert event.instance_number == projection.instance_number
    assert event.features == projection.features
    assert event.host_id == projection.host_id
    assert event.health == projection.health
  end
end
