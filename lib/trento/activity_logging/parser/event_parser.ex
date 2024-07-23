defmodule Trento.ActivityLog.Logger.Parser.EventParser do
  @moduledoc """
  Event parser extracts the event relevant information from the context.
  """

  def get_activity_actor(_, %{event: _}), do: "system"

  def get_activity_metadata(
        event_type,
        %{event: %event_type{} = event}
      ) do
    event
  end
end
