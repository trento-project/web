defmodule Trento.Infrastructure.Commanded.EventHandlers.RollUpEventHandler do
  @moduledoc """
  This event handler is responsible for rolling-up aggregates when a requested event is received.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "roll_up_event_handler",
    consistency: :strong,
    start_from: :current

  alias Trento.Infrastructure.Commanded.RollUp.RollUp

  alias Trento.Hosts.Events.{
    HostRolledUp,
    HostRollUpRequested
  }

  alias Trento.Databases.Events.{
    DatabaseRolledUp,
    DatabaseRollUpRequested
  }

  alias Trento.SapSystems.Events.{
    SapSystemRolledUp,
    SapSystemRollUpRequested
  }

  alias Trento.Clusters.Events.{
    ClusterRolledUp,
    ClusterRollUpRequested
  }

  def handle(
        %ClusterRollUpRequested{cluster_id: stream_id, snapshot: snapshot},
        _
      ) do
    roll_up_event = %ClusterRolledUp{
      cluster_id: stream_id,
      snapshot: snapshot
    }

    now = DateTime.to_iso8601(DateTime.utc_now())
    archive_stream_id = "#{stream_id}-archived-#{now}"

    RollUp.roll_up_aggregate(stream_id, roll_up_event, archive_stream_id)
  end

  def handle(%HostRollUpRequested{host_id: stream_id, snapshot: snapshot}, _) do
    roll_up_event = %HostRolledUp{
      host_id: stream_id,
      snapshot: snapshot
    }

    now = DateTime.to_iso8601(DateTime.utc_now())
    archive_stream_id = "#{stream_id}-archived-#{now}"

    RollUp.roll_up_aggregate(stream_id, roll_up_event, archive_stream_id)
  end

  def handle(%SapSystemRollUpRequested{sap_system_id: stream_id, snapshot: snapshot}, _) do
    roll_up_event = %SapSystemRolledUp{
      sap_system_id: stream_id,
      snapshot: snapshot
    }

    now = DateTime.to_iso8601(DateTime.utc_now())
    archive_stream_id = "#{stream_id}-archived-#{now}"

    RollUp.roll_up_aggregate(stream_id, roll_up_event, archive_stream_id)
  end

  def handle(%DatabaseRollUpRequested{database_id: stream_id, snapshot: snapshot}, _) do
    roll_up_event = %DatabaseRolledUp{
      database_id: stream_id,
      snapshot: snapshot
    }

    now = DateTime.to_iso8601(DateTime.utc_now())
    archive_stream_id = "#{stream_id}-archived-#{now}"

    RollUp.roll_up_aggregate(stream_id, roll_up_event, archive_stream_id)
  end
end
