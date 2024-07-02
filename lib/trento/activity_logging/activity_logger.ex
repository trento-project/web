defmodule Trento.ActivityLog.ActivityLogger do
  @moduledoc """
  ActivityLogger entry point
  """

  alias Trento.ActivityLog.ActivityLog
  alias Trento.ActivityLogging.Registry

  @callback log_activity(activity_context :: any()) :: :ok

  def log_activity(activity_context) do
    activity_parser = get_activity_parser(activity_context)

    detected_activity = activity_parser.detect_activity(activity_context)

    if Registry.interested?(detected_activity, activity_context) do
      %ActivityLog{}
      |> ActivityLog.changeset(%{
        type: get_activity_type(detected_activity),
        actor: get_actor(activity_parser, detected_activity, activity_context),
        metadata: get_metadata(activity_parser, detected_activity, activity_context)
      })
      |> Trento.Repo.insert()
    end

    :ok
  end

  defp get_activity_parser(%Plug.Conn{}), do: Trento.ActivityLogging.Logger.PhoenixConnParser
  # defp get_logger(%Pipeline{}), do: Trento.ActivityLogging.Logger.CommandedRecongnizer

  defp get_activity_type(detected_activity),
    do:
      detected_activity
      |> Registry.get_activity_type()
      |> Atom.to_string()

  defp get_actor(activity_parser, detected_activity, activity_context),
    do: activity_parser.get_activity_actor(detected_activity, activity_context)

  defp get_metadata(activity_parser, detected_activity, activity_context),
    do: activity_parser.get_activity_metadata(detected_activity, activity_context)
end
