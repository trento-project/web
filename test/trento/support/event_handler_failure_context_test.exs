defmodule Trento.Support.EventHandlerFailureContextTest do
  use ExUnit.Case

  alias Commanded.EventStore.TypeProvider

  setup do
    start_supervised!(TestCommandedApp)
    handler = start_supervised!(TestEventHandlerWithFailureContext)

    {:ok, %{handler: handler}}
  end

  test "should retry 3 times before shutting down and call the callback functions", %{
    handler: handler
  } do
    event = %TestEvent{data: "error"}

    send_event(event, handler)

    assert_receive {:retry, 1}
    assert_receive {:retry, 2}
    assert_receive :max_retries_reached

    assert Process.alive?(handler)
  end

  defp send_event(event, handler) do
    event_data = %EventStore.EventData{
      causation_id: UUID.uuid4(),
      correlation_id: UUID.uuid4(),
      event_type: TypeProvider.to_string(event),
      data: event,
      metadata: %{reply_to: self()}
    }

    send(
      handler,
      {:events,
       [
         %Commanded.EventStore.RecordedEvent{
           event_id: UUID.uuid4(),
           event_number: 1,
           stream_id: UUID.uuid4(),
           stream_version: 0,
           causation_id: event_data.causation_id,
           correlation_id: event_data.correlation_id,
           event_type: event_data.event_type,
           data: event_data.data,
           metadata: event_data.metadata,
           created_at: DateTime.utc_now()
         }
       ]}
    )
  end
end
