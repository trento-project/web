defmodule Trento.SapSystemProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.{
    ApplicationInstanceReadModel,
    SapSystemProjector,
    SapSystemReadModel
  }

  alias Trento.Domain.Events.SapSystemHealthChanged

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  test "should project a new SAP System when a SapSystemRegistered event is received" do
    event = build(:sap_system_registered_event)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")
    projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.sid == projection.sid
    assert event.tenant == projection.tenant
    assert event.db_host == projection.db_host
    assert event.health == projection.health
  end

  test "should update the health of a SAP System when a SapSystemHealthChanged event is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())
    event = %SapSystemHealthChanged{sap_system_id: sap_system_id, health: :critical}

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")
    projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.health == projection.health
  end

  test "should project a new application instance when ApplicationInstanceRegistered event is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())
    event = build(:application_instance_registered_event, sap_system_id: sap_system_id)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    projection =
      Repo.get_by(ApplicationInstanceReadModel,
        sap_system_id: event.sap_system_id,
        instance_number: event.instance_number,
        host_id: event.host_id
      )

    assert event.sid == projection.sid
    assert event.instance_number == projection.instance_number
    assert event.features == projection.features
    assert event.host_id == projection.host_id
    assert event.health == projection.health
  end
end
