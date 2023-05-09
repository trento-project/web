defmodule Trento.SapSystemProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.{
    ApplicationInstanceReadModel,
    SapSystemProjector,
    SapSystemReadModel
  }

  alias Trento.Domain.Events.{
    ApplicationInstanceHealthChanged,
    SapSystemDeregistered,
    SapSystemHealthChanged
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
    event = build(:sap_system_registered_event)

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    %{db_host: db_host, tenant: tenant, id: id, sid: sid, health: health} =
      projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.sid == projection.sid
    assert event.tenant == projection.tenant
    assert event.db_host == projection.db_host
    assert event.health == projection.health

    assert_broadcast "sap_system_registered",
                     %{
                       db_host: ^db_host,
                       health: ^health,
                       id: ^id,
                       sid: ^sid,
                       tenant: ^tenant
                     },
                     1000
  end

  test "should update the health of a SAP System when a SapSystemHealthChanged event is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())
    event = %SapSystemHealthChanged{sap_system_id: sap_system_id, health: :critical}

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")
    %{health: health} = projection = Repo.get!(SapSystemReadModel, event.sap_system_id)

    assert event.health == projection.health

    assert_broadcast "sap_system_health_changed",
                     %{
                       id: ^sap_system_id,
                       health: ^health
                     },
                     1000
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

    assert_broadcast "application_instance_registered",
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
  end

  test "should broadcast application_instance_health_changed when ApplicationInstanceHealthChanged event is received" do
    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())
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

    assert_broadcast "application_instance_health_changed",
                     %{
                       health: :critical,
                       host_id: ^host_id,
                       instance_number: ^instance_number,
                       sap_system_id: ^sap_system_id
                     },
                     1000
  end

  test "should update read model after deregistration" do
    deregistered_at = DateTime.utc_now()

    insert(:sap_system, id: sap_system_id = Faker.UUID.v4())

    event = %SapSystemDeregistered{
      sap_system_id: sap_system_id,
      deregistered_at: deregistered_at
    }

    ProjectorTestHelper.project(SapSystemProjector, event, "sap_system_projector")

    projection = Repo.get(SapSystemReadModel, sap_system_id)

    assert_broadcast "sap_system_deregistered",
                     %{sap_system_id: ^sap_system_id},
                     1000

    assert deregistered_at == projection.deregistered_at
  end
end
