defmodule Trento.SapSystems.Projections.SapSystemProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemProjector,
    SapSystemReadModel
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceHealthChanged,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRestored,
    SapSystemUpdated
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:sap_systems")

    %{socket: socket}
  end

  test "should project a new SAP System when a SapSystemRegistered event is received" do
    %{id: database_id, sid: database_sid} = insert(:database)
    event = build(:sap_system_registered_event, database_id: database_id)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    %{
      db_host: db_host,
      tenant: tenant,
      id: id,
      sid: sid,
      health: health,
      ensa_version: ensa_version
    } = projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.sid == projection.sid
    assert event.tenant == projection.tenant
    assert event.db_host == projection.db_host
    assert event.health == projection.health
    assert event.ensa_version == projection.ensa_version
    assert event.database_id == projection.database_id

    assert_broadcast(
      "sap_system_registered",
      %{
        db_host: ^db_host,
        health: ^health,
        id: ^id,
        sid: ^sid,
        tenant: ^tenant,
        ensa_version: ^ensa_version,
        database_id: ^database_id,
        database_sid: ^database_sid
      },
      1000
    )
  end

  test "should update the health of a SAP System when a SapSystemHealthChanged event is received" do
    %{id: sap_system_id} = insert(:sap_system)
    event = %SapSystemHealthChanged{sap_system_id: sap_system_id, health: :critical}

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")
    %{health: health} = projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.health == projection.health

    assert_broadcast(
      "sap_system_health_changed",
      %{
        id: ^sap_system_id,
        health: ^health
      },
      1000
    )
  end

  test "should project a new application instance when ApplicationInstanceRegistered event is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())
    event = build(:application_instance_registered_event, sap_system_id: sap_system_id)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    %{
      sid: sid,
      host_id: host_id,
      instance_number: instance_number,
      instance_hostname: instance_hostname,
      health: health,
      features: features,
      start_priority: start_priority
    } =
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

    assert_broadcast(
      "application_instance_registered",
      %{
        features: ^features,
        health: ^health,
        host_id: ^host_id,
        http_port: 8080,
        https_port: 8443,
        instance_hostname: ^instance_hostname,
        instance_number: ^instance_number,
        sap_system_id: ^sap_system_id,
        sid: ^sid,
        start_priority: ^start_priority
      },
      1000
    )
  end

  test "should move the application instance when an ApplicationInstanceMoved is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())

    %{host_id: old_host_id, instance_number: instance_number, sid: sid} =
      insert(:application_instance, sap_system_id: sap_system_id)

    event = %ApplicationInstanceMoved{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      old_host_id: old_host_id,
      new_host_id: new_host_id = Faker.UUID.v4()
    }

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    application_instance =
      Repo.get_by!(ApplicationInstanceReadModel,
        sap_system_id: event.sap_system_id,
        instance_number: event.instance_number
      )

    assert application_instance.host_id == event.new_host_id

    assert_broadcast(
      "application_instance_moved",
      %{
        sap_system_id: ^sap_system_id,
        instance_number: ^instance_number,
        old_host_id: ^old_host_id,
        new_host_id: ^new_host_id,
        sid: ^sid
      },
      1000
    )
  end

  test "should broadcast application_instance_health_changed when ApplicationInstanceHealthChanged event is received" do
    %{id: sap_system_id} = insert(:sap_system)
    event = build(:application_instance_registered_event, sap_system_id: sap_system_id)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    %{
      host_id: host_id,
      instance_number: instance_number
    } =
      Repo.get_by(ApplicationInstanceReadModel,
        sap_system_id: event.sap_system_id,
        instance_number: event.instance_number,
        host_id: event.host_id
      )

    health_event = %ApplicationInstanceHealthChanged{
      sap_system_id: sap_system_id,
      health: :critical,
      instance_number: instance_number,
      host_id: host_id
    }

    ProjectorTestHelper.project(SapSystemProjector, health_event, "sap_system_projector")

    assert_broadcast(
      "application_instance_health_changed",
      %{
        health: :critical,
        host_id: ^host_id,
        instance_number: ^instance_number,
        sap_system_id: ^sap_system_id
      },
      1000
    )
  end

  test "should update the absent_at field when ApplicationInstanceMarkedAbsent event is received" do
    %{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id,
      sid: sid
    } = insert(:application_instance)

    absent_at = DateTime.utc_now()

    marked_absent_event = %ApplicationInstanceMarkedAbsent{
      instance_number: instance_number,
      host_id: host_id,
      sap_system_id: sap_system_id,
      absent_at: absent_at
    }

    ProjectorTestHelper.project(SapSystemProjector, marked_absent_event, "sap_system_projector")

    assert_broadcast(
      "application_instance_absent_at_changed",
      %{
        instance_number: ^instance_number,
        host_id: ^host_id,
        sap_system_id: ^sap_system_id,
        sid: ^sid,
        absent_at: ^absent_at
      },
      1000
    )
  end

  test "should update the absent_at field when ApplicationInstanceMarkedPresent event is received" do
    %{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id,
      sid: sid
    } = insert(:application_instance, absent_at: DateTime.utc_now())

    marked_present_event = %ApplicationInstanceMarkedPresent{
      instance_number: instance_number,
      host_id: host_id,
      sap_system_id: sap_system_id
    }

    ProjectorTestHelper.project(SapSystemProjector, marked_present_event, "sap_system_projector")

    assert_broadcast(
      "application_instance_absent_at_changed",
      %{
        instance_number: ^instance_number,
        host_id: ^host_id,
        sap_system_id: ^sap_system_id,
        sid: ^sid,
        absent_at: nil
      },
      1000
    )
  end

  test "should update read model after deregistration" do
    deregistered_at = DateTime.utc_now()

    %{sid: sid} = insert(:sap_system, id: sap_system_id = Faker.UUID.v4())

    event = %SapSystemDeregistered{
      sap_system_id: sap_system_id,
      deregistered_at: deregistered_at
    }

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    projection = Repo.get(SapSystemReadModel, sap_system_id)

    assert_broadcast(
      "sap_system_deregistered",
      %{id: ^sap_system_id, sid: ^sid},
      1000
    )

    assert deregistered_at == projection.deregistered_at
  end

  test "should restore a SAP system when SapSystemRestored is received" do
    %{id: database_id, sid: database_sid, health: database_health} = insert(:database)

    %{tenant: tenant, id: sap_system_id, sid: sid} =
      insert(:sap_system, deregistered_at: DateTime.utc_now(), database_id: database_id)

    database_instance =
      insert(:database_instance, database_id: database_id)
      |> Map.from_struct()
      |> Map.delete(:__meta__)
      |> Map.delete(:host)

    application_instance =
      insert(:application_instance, sap_system_id: sap_system_id)
      |> Map.from_struct()
      |> Map.delete(:__meta__)
      |> Map.delete(:host)
      |> Map.delete(:sap_system)

    insert_list(5, :tag, resource_id: sap_system_id)

    new_db_host = Faker.Internet.ip_v4_address()
    new_health = :passing

    event = %SapSystemRestored{
      sap_system_id: sap_system_id,
      tenant: tenant,
      db_host: new_db_host,
      health: new_health,
      database_health: database_health
    }

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    %{tags: tags} =
      projection =
      SapSystemReadModel
      |> Repo.get(sap_system_id)
      |> Repo.preload([:tags, :database])

    adapted_database_instance =
      Map.put(database_instance, :sap_system_id, database_id)

    assert_broadcast(
      "sap_system_restored",
      %{
        db_host: ^new_db_host,
        health: ^new_health,
        id: ^sap_system_id,
        sid: ^sid,
        tenant: ^tenant,
        database_instances: [^adapted_database_instance],
        application_instances: [^application_instance],
        tags: ^tags,
        database_sid: ^database_sid,
        database_id: ^database_id
      },
      1000
    )

    assert nil == projection.deregistered_at
  end

  test "should remove an application instance from the read model after a deregistration" do
    deregistered_at = DateTime.utc_now()

    %{
      sid: sid,
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    } = insert(:application_instance)

    insert_list(4, :application_instance)

    event = %ApplicationInstanceDeregistered{
      instance_number: instance_number,
      host_id: host_id,
      sap_system_id: sap_system_id,
      deregistered_at: deregistered_at
    }

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    assert nil ==
             Repo.get_by(ApplicationInstanceReadModel,
               sap_system_id: sap_system_id,
               instance_number: instance_number,
               host_id: host_id
             )

    assert 4 ==
             ApplicationInstanceReadModel
             |> Repo.all()
             |> Enum.count()

    assert_broadcast(
      "application_instance_deregistered",
      %{
        sap_system_id: ^sap_system_id,
        instance_number: ^instance_number,
        host_id: ^host_id,
        sid: ^sid
      },
      1000
    )
  end

  test "should update an already existing SAP System when a SapSystemUpdated event is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4(), ensa_version: EnsaVersion.no_ensa())

    event = %SapSystemUpdated{
      sap_system_id: sap_system_id,
      ensa_version: EnsaVersion.ensa1()
    }

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    %{
      id: id,
      ensa_version: ensa_version
    } = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.ensa_version == ensa_version

    assert_broadcast(
      "sap_system_updated",
      %{
        id: ^id,
        ensa_version: ^ensa_version
      },
      1000
    )
  end
end
