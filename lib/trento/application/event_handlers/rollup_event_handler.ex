defmodule Trento.RollupEventHandler do
  @moduledoc """
    This event handler is responsible for rolling up aggregates.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "roll_up_event_handler",
    consistency: :strong

  alias Trento.Domain.Events.ClusterRolledUp

  def handle(
        %ClusterRolledUp{cluster_id: cluster_id, applied: false} = event,
        _
      ) do
    rollup_aggregate(cluster_id, event)
  end

  defp rollup_aggregate(aggregate_id, event) do
    {:ok, pid} = Postgrex.start_link(Trento.EventStore.config())

    Postgrex.transaction(pid, fn conn ->
      with :ok <- Trento.EventStore.delete_snapshot(aggregate_id, conn: conn),
           :ok <- Trento.EventStore.delete_stream(aggregate_id, :any_version, :hard, conn: conn) do
        Trento.EventStore.append_to_stream(
          aggregate_id,
          :any_version,
          [
            %EventStore.EventData{
              causation_id: UUID.uuid4(),
              correlation_id: UUID.uuid4(),
              event_type: Commanded.EventStore.TypeProvider.to_string(event),
              data: %{event | applied: true},
              metadata: %{}
            }
          ],
          conn: conn
        )
      end
    end)
  end
end
