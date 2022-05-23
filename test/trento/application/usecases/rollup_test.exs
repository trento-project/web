defmodule Trento.RollupTest do
  use Trento.EventStoreCase, async: false

  alias Trento.Rollup

  test "should rollback if no stream was found" do
    {:error, :rollback} = Rollup.rollup_aggregate(Faker.UUID.v4(), %TestRollupEvent{})
  end

  test "should rollup and append an applied rollup event", %{conn: conn} do
    stream_id = Faker.UUID.v4()
    event = %TestRollupEvent{data: "data"}

    :ok =
      Trento.EventStore.append_to_stream(
        stream_id,
        0,
        [
          %EventStore.EventData{
            causation_id: UUID.uuid4(),
            correlation_id: UUID.uuid4(),
            event_type: Commanded.EventStore.TypeProvider.to_string(event),
            data: event,
            metadata: %{}
          }
        ],
        conn: conn
      )

    assert {:ok, :ok} = Rollup.rollup_aggregate(stream_id, event)

    assert {:ok,
            [
              %EventStore.RecordedEvent{
                data: %TestRollupEvent{data: "data", applied: true}
              }
            ]} = Trento.EventStore.read_stream_forward(stream_id)
  end
end
