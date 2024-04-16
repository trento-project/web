defmodule Trento.Infrastructure.Commanded.EventHandlers.StreamRollUpEventHandlerTest do
  use ExUnit.Case
  use Trento.EventStoreCase

  import Mox
  import Trento.Factory

  alias Trento.Clusters.Commands.RollUpCluster
  alias Trento.Databases.Commands.RollUpDatabase
  alias Trento.Hosts.Commands.RollUpHost
  alias Trento.SapSystems.Commands.RollUpSapSystem

  alias Trento.Infrastructure.Commanded.EventHandlers.StreamRollUpEventHandler

  alias Commanded.EventStore.TypeProvider

  setup [:set_mox_from_context, :verify_on_exit!]

  @max_stream_version Application.compile_env!(:trento, [
                        Trento.Infrastructure.Commanded.EventHandlers.StreamRollUpEventHandler,
                        :max_stream_version
                      ])

  test "should dispatch the host roll-up command" do
    host_id = Faker.UUID.v4()

    :ok =
      Trento.EventStore.append_to_stream(
        host_id,
        0,
        Enum.map(0..@max_stream_version, fn _ ->
          event = TestEvent.new!(%{"data" => Faker.StarWars.quote()})

          %EventStore.EventData{
            causation_id: UUID.uuid4(),
            correlation_id: UUID.uuid4(),
            event_type: TypeProvider.to_string(event),
            data: event,
            metadata: %{}
          }
        end)
      )

    event = build(:host_registered_event, host_id: host_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpHost{host_id: ^host_id}, _ ->
      :ok
    end)

    assert :ok =
             StreamRollUpEventHandler.handle(event, %{stream_version: @max_stream_version + 1})
  end

  test "should dispatch the cluster roll-up command" do
    cluster_id = Faker.UUID.v4()

    :ok =
      Trento.EventStore.append_to_stream(
        cluster_id,
        0,
        Enum.map(0..@max_stream_version, fn _ ->
          event = TestEvent.new!(%{"data" => Faker.StarWars.quote()})

          %EventStore.EventData{
            causation_id: UUID.uuid4(),
            correlation_id: UUID.uuid4(),
            event_type: TypeProvider.to_string(event),
            data: event,
            metadata: %{}
          }
        end)
      )

    event = build(:host_added_to_cluster_event, cluster_id: cluster_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpCluster{cluster_id: ^cluster_id}, _ ->
      :ok
    end)

    assert :ok =
             StreamRollUpEventHandler.handle(event, %{stream_version: @max_stream_version + 1})
  end

  test "should dispatch the sap system roll-up command" do
    sap_system_id = Faker.UUID.v4()

    :ok =
      Trento.EventStore.append_to_stream(
        sap_system_id,
        0,
        Enum.map(0..@max_stream_version, fn _ ->
          event = TestEvent.new!(%{"data" => Faker.StarWars.quote()})

          %EventStore.EventData{
            causation_id: UUID.uuid4(),
            correlation_id: UUID.uuid4(),
            event_type: TypeProvider.to_string(event),
            data: event,
            metadata: %{}
          }
        end)
      )

    event = build(:application_instance_registered_event, sap_system_id: sap_system_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpSapSystem{
                                                  sap_system_id: ^sap_system_id
                                                },
                                                _ ->
      :ok
    end)

    assert :ok =
             StreamRollUpEventHandler.handle(event, %{stream_version: @max_stream_version + 1})
  end

  test "should dispatch the database roll-up command" do
    database_id = Faker.UUID.v4()

    :ok =
      Trento.EventStore.append_to_stream(
        database_id,
        0,
        Enum.map(0..@max_stream_version, fn _ ->
          event = TestEvent.new!(%{"data" => Faker.StarWars.quote()})

          %EventStore.EventData{
            causation_id: UUID.uuid4(),
            correlation_id: UUID.uuid4(),
            event_type: TypeProvider.to_string(event),
            data: event,
            metadata: %{}
          }
        end)
      )

    event = build(:database_instance_registered_event, database_id: database_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpDatabase{
                                                  database_id: ^database_id
                                                },
                                                _ ->
      :ok
    end)

    assert :ok =
             StreamRollUpEventHandler.handle(event, %{stream_version: @max_stream_version + 1})
  end

  test "should dispatch the host roll-up command when HostTombstoned is received" do
    host_id = UUID.uuid4()
    event = build(:host_tombstoned_event, host_id: host_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpHost{host_id: ^host_id}, _ ->
      :ok
    end)

    assert :ok = StreamRollUpEventHandler.handle(event, %{stream_version: 1})
  end

  test "should dispatch the cluster roll-up command when ClusterTombstoned is received" do
    cluster_id = UUID.uuid4()
    event = build(:cluster_tombstoned_event, cluster_id: cluster_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpCluster{cluster_id: ^cluster_id}, _ ->
      :ok
    end)

    assert :ok = StreamRollUpEventHandler.handle(event, %{stream_version: 1})
  end

  test "should dispatch the SAP system roll-up command when SapSystemTombstoned is received" do
    sap_system_id = UUID.uuid4()
    event = build(:sap_system_tombstoned_event, sap_system_id: sap_system_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpSapSystem{
                                                  sap_system_id: ^sap_system_id
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = StreamRollUpEventHandler.handle(event, %{stream_version: 1})
  end

  test "should dispatch the database roll-up command when DatabaseTombstoned is received" do
    database_id = UUID.uuid4()
    event = build(:database_tombstoned_event, database_id: database_id)

    expect(Trento.Commanded.Mock, :dispatch, fn %RollUpDatabase{
                                                  database_id: ^database_id
                                                },
                                                _ ->
      :ok
    end)

    assert :ok = StreamRollUpEventHandler.handle(event, %{stream_version: 1})
  end
end
