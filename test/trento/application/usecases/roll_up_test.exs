defmodule Trento.RollUpTest do
  use Trento.EventStoreCase, async: false

  alias Trento.RollUp

  alias Commanded.Event.Upcaster
  alias Commanded.EventStore.TypeProvider

  test "should roll-up and append roll-up event", %{conn: conn} do
    stream_id = Faker.UUID.v4()
    old_event = %TestEvent{data: "data"}

    :ok =
      Trento.EventStore.append_to_stream(
        stream_id,
        0,
        [
          %EventStore.EventData{
            causation_id: UUID.uuid4(),
            correlation_id: UUID.uuid4(),
            event_type: TypeProvider.to_string(old_event),
            data: old_event,
            metadata: %{}
          }
        ],
        conn: conn
      )

    roll_up_event = %TestRollUpEvent{snapshot: %{"data" => "data"}}
    archive_stream_id = "#{stream_id}-archived"

    assert :ok = RollUp.roll_up_aggregate(stream_id, roll_up_event, archive_stream_id)

    assert {:ok,
            [
              %EventStore.RecordedEvent{
                data: data,
                stream_version: 1
              }
            ]} = Trento.EventStore.read_stream_forward(archive_stream_id)

    assert old_event == Upcaster.upcast(data, %{})

    assert {:ok,
            [
              %EventStore.RecordedEvent{
                data: data,
                stream_version: 1
              }
            ]} = Trento.EventStore.read_stream_forward(stream_id)

    assert roll_up_event == Upcaster.upcast(data, %{})

    assert {:ok,
            [
              %EventStore.RecordedEvent{
                data: data,
                stream_version: 1,
                event_number: 2
              }
            ]} = Trento.EventStore.read_all_streams_forward()

    assert roll_up_event == Upcaster.upcast(data, %{})
  end
end
