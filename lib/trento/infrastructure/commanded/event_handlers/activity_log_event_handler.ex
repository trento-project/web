defmodule Trento.Infrastructure.Commanded.EventHandlers.ActivityLogEventHandler do
  @moduledoc """
  Event handler responsible to log activity from emitted domain events
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "activity_log_event_handler"

  alias Trento.ActivityLog.ActivityLogger

  def handle(event, metadata) do
    ActivityLogger.log_activity(%{
      event: event,
      metadata: metadata
    })

    :ok
  end
end
