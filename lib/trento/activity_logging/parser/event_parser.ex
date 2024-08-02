defmodule Trento.ActivityLog.Logger.Parser.EventParser do
  @moduledoc """
  Event parser extracts the event relevant information from the context.
  """

  def get_activity_actor(_, %{event: _}), do: "system"
  def get_activity_actor(_, _), do: nil

  def get_activity_metadata(_, %{event: event}), do: event
  def get_activity_metadata(_, _), do: %{}
end
