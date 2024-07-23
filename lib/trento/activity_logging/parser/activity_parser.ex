defmodule Trento.ActivityLog.Parser.ActivityParser do
  @moduledoc """
  Activity parser extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLog.ActivityCatalog
  alias Trento.ActivityLog.Logger.Parser.PhoenixConnParser

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  @spec to_activity_log(ActivityCatalog.logged_activity(), any()) ::
          {:ok, map()} | {:error, any()}
  def to_activity_log(activity, %Plug.Conn{} = activity_context)
      when activity in ActivityCatalog.activity_catalog() do
    {:ok,
     %{
       type:
         activity
         |> ActivityCatalog.get_activity_type()
         |> Atom.to_string(),
       actor: PhoenixConnParser.get_activity_actor(activity, activity_context),
       metadata: PhoenixConnParser.get_activity_metadata(activity, activity_context)
     }}
  end

  def to_activity_log(_, _), do: {:error, :cannot_parse_activity}
end
