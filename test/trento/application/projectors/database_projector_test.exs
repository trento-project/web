defmodule Trento.DatabaseProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.{
    DatabaseInstanceReadModel,
    DatabaseProjector,
    DatabaseReadModel
  }

  alias Trento.Domain.Events.{
    DatabaseHealthChanged,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceSystemReplicationChanged
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:databases")

    %{socket: socket}
  end

  test "should project a new database when DatabaseRegistered event is received" do
    %{sap_system_id: sap_system_id} = event = build(:database_registered_event)

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    %{sid: sid, health: health} =
      database_projection = Repo.get!(DatabaseReadModel, event.sap_system_id)

    assert event.sap_system_id == database_projection.id
    assert event.sid == database_projection.sid
    assert event.health == database_projection.health

    assert_broadcast "database_registered",
                     %{
                       health: ^health,
                       id: ^sap_system_id,
                       sid: ^sid
                     },
                     1000
  end

  test "should update the health of a Database when a DatabaseHealthChanged event is received" do
    insert(:database, id: sap_system_id = Faker.UUID.v4())
    event = %DatabaseHealthChanged{sap_system_id: sap_system_id, health: :critical}

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")
    projection = Repo.get!(DatabaseReadModel, event.sap_system_id)

    assert event.health == projection.health

    assert_broadcast "database_health_changed", %{health: :critical, id: ^sap_system_id}, 1000
  end

  test "should project a new database instance when DatabaseInstanceRegistered event is received" do
    insert(:database, id: sap_system_id = Faker.UUID.v4())
    event = build(:database_instance_registered_event, sap_system_id: sap_system_id)

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    %{
      health: health,
      sid: sid,
      features: features,
      host_id: host_id,
      tenant: tenant,
      system_replication: system_replication,
      system_replication_status: system_replication_status
    } =
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

    assert_broadcast "database_instance_registered",
                     %{
                       health: ^health,
                       sid: ^sid,
                       features: ^features,
                       host_id: ^host_id,
                       http_port: 8080,
                       https_port: 8443,
                       instance_hostname: "an-instance-name",
                       instance_number: "00",
                       sap_system_id: ^sap_system_id,
                       start_priority: "0.3",
                       system_replication: ^system_replication,
                       system_replication_status: ^system_replication_status,
                       tenant: ^tenant
                     },
                     1000
  end

  test "should update the system replication when DatabaseInstanceSystemReplicationChanged is received" do
    %{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      insert(
        :database_instance_without_host,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    %{
      system_replication: system_replication,
      system_replication_status: system_replication_status
    } =
      event = %DatabaseInstanceSystemReplicationChanged{
        sap_system_id: sap_system_id,
        instance_number: instance_number,
        host_id: host_id,
        system_replication: "Primary",
        system_replication_status: "Active"
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

    assert_broadcast "database_instance_system_replication_changed",
                     %{
                       sap_system_id: ^sap_system_id,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       system_replication: ^system_replication,
                       system_replication_status: ^system_replication_status
                     },
                     1000
  end

  test "should update the system replication when DatabaseInstanceSystemReplicationChanged with nil values is received" do
    %{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      insert(
        :database_instance_without_host,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    event = %DatabaseInstanceSystemReplicationChanged{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id,
      system_replication: nil,
      system_replication_status: nil
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    projection =
      Repo.get_by!(DatabaseInstanceReadModel,
        sap_system_id: sap_system_id,
        instance_number: instance_number,
        host_id: host_id
      )

    assert nil == projection.system_replication
    assert nil == projection.system_replication_status

    assert_broadcast "database_instance_system_replication_changed",
                     %{
                       sap_system_id: ^sap_system_id,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       system_replication: nil,
                       system_replication_status: nil
                     },
                     1000
  end

  test "should broadcast database_instance_health_changed when DatabaseInstanceHealthChanged is received" do
    %{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      insert(
        :database_instance_without_host,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    event = %DatabaseInstanceHealthChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      health: :critical
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert_broadcast "database_instance_health_changed",
                     %{
                       sap_system_id: ^sap_system_id,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       health: :critical
                     },
                     1000
  end
end
