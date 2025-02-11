defmodule Trento.Databases.Projections.DatabaseProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseProjector,
    DatabaseReadModel
  }

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseHealthChanged,
    DatabaseInstanceDeregistered,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceMarkedPresent,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRestored,
    DatabaseTenantsUpdated
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
    %{database_id: database_id} = event = build(:database_registered_event)

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    %{sid: sid, health: health} =
      database_projection = Repo.get!(DatabaseReadModel, event.database_id)

    assert event.database_id == database_projection.id
    assert event.sid == database_projection.sid
    assert event.health == database_projection.health

    assert_broadcast "database_registered",
                     %{
                       health: ^health,
                       id: ^database_id,
                       sid: ^sid
                     },
                     1000
  end

  test "should update the health of a Database when a DatabaseHealthChanged event is received" do
    insert(:database, id: database_id = Faker.UUID.v4())
    event = %DatabaseHealthChanged{database_id: database_id, health: :critical}

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")
    projection = Repo.get!(DatabaseReadModel, event.database_id)

    assert event.health == projection.health

    assert_broadcast "database_health_changed", %{health: :critical, id: ^database_id}, 1000
  end

  test "should project a new database instance when DatabaseInstanceRegistered event is received" do
    %{id: database_id} = insert(:database)

    event =
      build(
        :database_instance_registered_event,
        database_id: database_id,
        system_replication: "",
        system_replication_status: ""
      )

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    %{
      health: health,
      sid: sid,
      features: features,
      host_id: host_id
    } =
      database_instance_projection =
      Repo.get_by(DatabaseInstanceReadModel,
        database_id: event.database_id,
        instance_number: event.instance_number,
        host_id: event.host_id
      )

    assert event.database_id == database_instance_projection.database_id
    assert event.sid == database_instance_projection.sid
    assert event.instance_number == database_instance_projection.instance_number
    assert event.features == database_instance_projection.features
    assert event.host_id == database_instance_projection.host_id
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
                       database_id: ^database_id,
                       start_priority: "0.3",
                       system_replication: "",
                       system_replication_status: ""
                     },
                     1000
  end

  test "should project a new database instance as Primary" do
    %{id: database_id} = insert(:database)

    event =
      build(
        :database_instance_registered_event,
        database_id: database_id,
        system_replication: "Primary",
        system_replication_status: "ACTIVE"
      )

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert_broadcast "database_instance_registered",
                     %{
                       system_replication: "Primary",
                       system_replication_status: ""
                     },
                     1000
  end

  test "should project a new database instance as Secondary" do
    %{id: database_id} = insert(:database)

    insert(
      :database_instance,
      database_id: database_id,
      system_replication: "Primary",
      system_replication_status: "ACTIVE"
    )

    event =
      build(
        :database_instance_registered_event,
        database_id: database_id,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert_broadcast "database_instance_registered",
                     %{
                       system_replication: "Secondary",
                       system_replication_status: "ACTIVE"
                     },
                     1000
  end

  test "should update the system replication when DatabaseInstanceSystemReplicationChanged is received" do
    %{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      insert(
        :database_instance,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    %{
      system_replication: system_replication,
      system_replication_status: system_replication_status
    } =
      event = %DatabaseInstanceSystemReplicationChanged{
        database_id: database_id,
        instance_number: instance_number,
        host_id: host_id,
        system_replication: "Primary",
        system_replication_status: "Active"
      }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    projection =
      Repo.get_by!(DatabaseInstanceReadModel,
        database_id: database_id,
        instance_number: instance_number,
        host_id: host_id
      )

    assert event.system_replication == projection.system_replication
    assert event.system_replication_status == projection.system_replication_status

    assert_broadcast "database_instance_system_replication_changed",
                     %{
                       database_id: ^database_id,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       system_replication: ^system_replication,
                       system_replication_status: ^system_replication_status
                     },
                     1000
  end

  test "should update the system replication when DatabaseInstanceSystemReplicationChanged with nil values is received" do
    %{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      insert(
        :database_instance,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    event = %DatabaseInstanceSystemReplicationChanged{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id,
      system_replication: nil,
      system_replication_status: nil
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    projection =
      Repo.get_by!(DatabaseInstanceReadModel,
        database_id: database_id,
        instance_number: instance_number,
        host_id: host_id
      )

    assert nil == projection.system_replication
    assert nil == projection.system_replication_status

    assert_broadcast "database_instance_system_replication_changed",
                     %{
                       database_id: ^database_id,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       system_replication: nil,
                       system_replication_status: nil
                     },
                     1000
  end

  test "should broadcast database_instance_health_changed when DatabaseInstanceHealthChanged is received" do
    %{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id
    } =
      insert(
        :database_instance,
        system_replication: "Secondary",
        system_replication_status: ""
      )

    event = %DatabaseInstanceHealthChanged{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      health: :critical
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert_broadcast "database_instance_health_changed",
                     %{
                       database_id: ^database_id,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       health: :critical
                     },
                     1000
  end

  test "should update the absent_at field when DatabaseInstanceMarkedAbsent event is received" do
    %{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id,
      sid: sid
    } = insert(:database_instance)

    absent_at = DateTime.utc_now()

    event = %DatabaseInstanceMarkedAbsent{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id,
      absent_at: absent_at
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert_broadcast(
      "database_instance_absent_at_changed",
      %{
        instance_number: ^instance_number,
        host_id: ^host_id,
        database_id: ^database_id,
        sid: ^sid,
        absent_at: ^absent_at
      },
      1000
    )
  end

  test "should update the absent_at field when DatabaseInstanceMarkedPresent event is received" do
    %{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id,
      sid: sid
    } = insert(:database_instance, absent_at: DateTime.utc_now())

    event = %DatabaseInstanceMarkedPresent{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert_broadcast(
      "database_instance_absent_at_changed",
      %{
        instance_number: ^instance_number,
        host_id: ^host_id,
        database_id: ^database_id,
        sid: ^sid,
        absent_at: nil
      },
      1000
    )
  end

  test "should update the database read model after a deregistration" do
    deregistered_at = DateTime.utc_now()

    %{id: database_id} = insert(:database)

    event = %DatabaseDeregistered{
      database_id: database_id,
      deregistered_at: deregistered_at
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    projection = %{sid: sid} = Repo.get(DatabaseReadModel, database_id)

    assert_broadcast "database_deregistered",
                     %{id: ^database_id, sid: ^sid},
                     1000

    assert deregistered_at == projection.deregistered_at
  end

  test "should remove a database instance from the read model after a deregistration" do
    deregistered_at = DateTime.utc_now()

    %{
      sid: sid,
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id
    } = insert(:database_instance)

    insert_list(4, :database_instance)

    event = %DatabaseInstanceDeregistered{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id,
      deregistered_at: deregistered_at
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    assert nil ==
             Repo.get_by(DatabaseInstanceReadModel,
               database_id: database_id,
               instance_number: instance_number,
               host_id: host_id
             )

    assert 4 ==
             DatabaseInstanceReadModel
             |> Repo.all()
             |> Enum.count()

    assert_broadcast "database_instance_deregistered",
                     %{
                       database_id: ^database_id,
                       instance_number: ^instance_number,
                       host_id: ^host_id,
                       sid: ^sid
                     },
                     1000
  end

  test "should restore a deregistered database when DatabaseRestored is received" do
    %{id: database_id} =
      insert(:database,
        sid: "NWD",
        deregistered_at: DateTime.utc_now(),
        health: :critical
      )

    database_instances =
      insert(:database_instance, database_id: database_id)
      |> Map.from_struct()
      |> Map.delete(:__meta__)
      |> Map.delete(:host)

    insert_list(5, :tag, resource_id: database_id)

    event = %DatabaseRestored{
      database_id: database_id,
      health: :passing
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    %{tags: tags} =
      projection =
      DatabaseReadModel
      |> Repo.get(database_id)
      |> Repo.preload([:tags, :database_instances])

    assert nil == projection.deregistered_at
    assert :passing == projection.health

    adapted_database_instances =
      Map.put(database_instances, :sap_system_id, database_id)

    assert_broadcast "database_restored",
                     %{
                       health: :passing,
                       id: ^database_id,
                       sid: "NWD",
                       database_instances: [^adapted_database_instances],
                       tags: ^tags
                     },
                     1000
  end

  test "should project database tenants when DatabaseTenantsUpdated is received" do
    tenants = build_list(2, :tenant)

    %{id: database_id} =
      insert(:database,
        sid: "NWD",
        deregistered_at: DateTime.utc_now(),
        health: :critical
      )

    event = %DatabaseTenantsUpdated{
      database_id: database_id,
      tenants: tenants
    }

    ProjectorTestHelper.project(DatabaseProjector, event, "database_projector")

    projection = Repo.get(DatabaseReadModel, database_id)

    broadcasted_tenants =
      Enum.map(tenants, fn %{name: name} ->
        %{name: name}
      end)

    assert tenants == projection.tenants

    assert_broadcast "database_tenants_updated",
                     %{database_id: ^database_id, tenants: ^broadcasted_tenants},
                     1000
  end
end
