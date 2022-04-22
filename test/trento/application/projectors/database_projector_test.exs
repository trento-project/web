defmodule Trento.DatabaseProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.{
    DatabaseInstanceReadModel,
    DatabaseProjector,
    DatabaseReadModel
  }

  alias Trento.Domain.Events.{
    DatabaseHealthChanged,
    DatabaseInstanceSystemReplicationChanged
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  test "should project a new database when DatabaseRegistered event is received" do
    event = database_registered_event()

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")
    database_projection = Repo.get!(DatabaseReadModel, event.sap_system_id)

    assert event.sap_system_id == database_projection.id
    assert event.sid == database_projection.sid
    assert event.health == database_projection.health
  end

  test "should update the health of a Database when a DatabaseHealthChanged event is received" do
    database_projection(id: sap_system_id = Faker.UUID.v4())
    event = %DatabaseHealthChanged{sap_system_id: sap_system_id, health: :critical}

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")
    projection = Repo.get!(DatabaseReadModel, event.sap_system_id)

    assert event.health == projection.health
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
    assert event.system_replication == database_instance_projection.system_replication

    assert event.system_replication_status ==
             database_instance_projection.system_replication_status

    assert event.health == database_instance_projection.health
  end

  test "should update the system replication when DatabaseInstanceSystemReplicationChanged is received" do
    %{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      database_instance_projection_without_host(
        system_replication: "Secondary",
        system_replication_status: ""
      )

    event = %DatabaseInstanceSystemReplicationChanged{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id,
      system_replication: "Primary",
      system_replication_status: "ACTIVE"
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    projection =
      Repo.get_by!(DatabaseInstanceReadModel,
        sap_system_id: sap_system_id,
        instance_number: instance_number,
        host_id: host_id
      )

    assert event.system_replication == projection.system_replication
    assert event.system_replication_status == projection.system_replication_status
  end
end
