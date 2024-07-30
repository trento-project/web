defmodule Trento.ActivityLog.Logger.Parser.EventParser do
  @moduledoc """
  Event parser extracts the event relevant information from the context.
  """
  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  def get_activity_actor(event_type, %{event: _})
      when event_type in ActivityCatalog.domain_event_activities(),
      do: "system"

  def get_activity_actor(_, _), do: nil

  def get_activity_metadata(
        event_type,
        %{event: event}
      )
      when event_type in ActivityCatalog.domain_event_activities() do
    event
  end

  def get_activity_metadata(_, _), do: %{}
end
