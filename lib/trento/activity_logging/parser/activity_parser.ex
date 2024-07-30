defmodule Trento.ActivityLog.Parser.ActivityParser do
  @moduledoc """
  Activity parser extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLog.ActivityCatalog
  alias Trento.ActivityLog.Logger.Parser.{EventParser, PhoenixConnParser}

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  def to_activity_log(activity, activity_context)
      when activity in ActivityCatalog.activity_catalog() do
    {:ok,
     %{
       type:
         activity
         |> ActivityCatalog.get_activity_type()
         |> Atom.to_string(),
       actor: get_activity_actor(activity, activity_context),
       metadata: get_activity_metadata(activity, activity_context)
     }}
  end

  def to_activity_log(_, _), do: {:error, :cannot_parse_activity}

  defp get_activity_actor(activity, activity_context)
       when activity in ActivityCatalog.connection_activities(),
       do: PhoenixConnParser.get_activity_actor(activity, activity_context)

  defp get_activity_actor(activity, activity_context)
       when activity in ActivityCatalog.domain_event_activities(),
       do: EventParser.get_activity_actor(activity, activity_context)

  defp get_activity_metadata(activity, activity_context)
       when activity in ActivityCatalog.connection_activities(),
       do: PhoenixConnParser.get_activity_metadata(activity, activity_context)

  defp get_activity_metadata(activity, activity_context)
       when activity in ActivityCatalog.domain_event_activities(),
       do: EventParser.get_activity_metadata(activity, activity_context)
end
