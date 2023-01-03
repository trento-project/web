defmodule Trento.StreamRollUpEventHandler do
  @moduledoc """
  This module is responsible for triggering the roll-up of an aggregate.

  Once the stream version of an aggregate reaches a certain threshold, the roll-up process is triggered.
  The roll-up process consists of archiving the stream and creating a snapshot event of the aggregate,
  during the roll-up process, the aggregate is locked to prevent any other event from being applied.

  Not all events trigger a roll-up, for instance roll-up related events are ignored to avoid side-effects.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "stream_roll_up_event_handler"

  alias Trento.Domain.Commands.RollUpCluster

  require Logger

  @max_stream_version Application.compile_env!(:trento, [__MODULE__, :max_stream_version])

  @cluster_events [
    Trento.Domain.Events.ChecksExecutionCompleted,
    Trento.Domain.Events.ChecksExecutionRequested,
    Trento.Domain.Events.ChecksExecutionStarted,
    Trento.Domain.Events.ChecksSelected,
    Trento.Domain.Events.ClusterChecksHealthChanged,
    Trento.Domain.Events.ClusterDetailsUpdated,
    Trento.Domain.Events.ClusterDiscoveredHealthChanged,
    Trento.Domain.Events.ClusterHealthChanged,
    Trento.Domain.Events.ClusterRegistered,
    Trento.Domain.Events.HostAddedToCluster,
    Trento.Domain.Events.HostChecksExecutionCompleted
  ]

  def handle(%event_type{cluster_id: cluster_id}, %{
        stream_version: event_stream_version
      })
      when event_type in @cluster_events and event_stream_version > @max_stream_version do
    # This is needed to check if an event already triggered a roll-up
    {:ok, %EventStore.Streams.StreamInfo{stream_version: stream_version}} =
      Trento.EventStore.stream_info(cluster_id)

    if stream_version > @max_stream_version do
      Logger.info(
        "Rolling up cluster: #{cluster_id} because  #{stream_version} > #{@max_stream_version}"
      )

      commanded().dispatch(%RollUpCluster{cluster_id: cluster_id},
        consistency: :strong
      )
    else
      :ok
    end
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
