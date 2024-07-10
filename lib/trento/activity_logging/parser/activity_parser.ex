defmodule Trento.ActivityLog.Parser.ActivityParser do
  @moduledoc """
  Behavior for activity parsers.
  It extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLog.ActivityCatalog
  alias Trento.ActivityLog.ActivityLog
  alias Trento.ActivityLog.Logger.Parser.PhoenixConnParser

  @doc """
  Converts the activity context to an activity log entry.
  If the activity is not interesting, it returns false.
  """
  @spec to_activity_log(any()) :: nil | ActivityLog.t() | {:error, any()}
  def to_activity_log(%Plug.Conn{} = activity_context) do
    with activity <- PhoenixConnParser.detect_activity(activity_context),
         true <- ActivityCatalog.interested?(activity, activity_context) do
      %{
        type: ActivityCatalog.get_activity_type(activity) |> Atom.to_string(),
        actor: PhoenixConnParser.get_activity_actor(activity, activity_context),
        metadata: PhoenixConnParser.get_activity_metadata(activity, activity_context)
      }
    end
  end

  def to_activity_log(_), do: nil
end
