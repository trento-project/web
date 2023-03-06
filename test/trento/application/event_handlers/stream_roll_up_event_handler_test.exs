defmodule Trento.StreamRollUpEventHandlerTest do
  use ExUnit.Case
  use Trento.EventStoreCase

  import Mox
  import Trento.Factory

  alias Trento.Domain.Commands.{
    RollUpCluster,
    RollupHost
  }

  alias Trento.StreamRollUpEventHandler

  alias Commanded.EventStore.TypeProvider

  setup [:set_mox_from_context, :verify_on_exit!]

  @max_stream_version Application.compile_env!(:trento, [
                        Trento.StreamRollUpEventHandler,
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

    expect(Trento.Commanded.Mock, :dispatch, fn %RollupHost{host_id: ^host_id}, _ ->
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
end
