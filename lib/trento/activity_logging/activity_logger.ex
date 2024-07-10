defmodule Trento.ActivityLog.ActivityLogger do
  @moduledoc """
  ActivityLogger entry point
  """

  alias Trento.Repo

  alias Trento.ActivityLog.ActivityCatalog
  alias Trento.ActivityLog.ActivityLog

  require Logger

  def log_activity(activity_context) do
    with {:ok, activity_parser} <- get_activity_parser(activity_context),
         detected_activity <- detect_activity(activity_parser, activity_context),
         true <- ActivityCatalog.interested?(detected_activity, activity_context) do
      write_log(%{
        type: get_activity_type(detected_activity),
        actor: get_actor(activity_parser, detected_activity, activity_context),
        metadata: get_metadata(activity_parser, detected_activity, activity_context)
      })
    end

    :ok
  end

  defp get_activity_parser(%Plug.Conn{}),
    do: {:ok, Trento.ActivityLog.Logger.Parser.PhoenixConnParser}

  defp get_activity_parser(_), do: {:error, :unsupported_activity}

  # defp get_activity_parser(%Commanded.Middleware.Pipeline{}),
  #   do: {:ok, Trento.ActivityLog.Logger.Parser.CommandedParser}

  defp detect_activity(activity_parser, activity_context),
    do: activity_parser.detect_activity(activity_context)

  defp get_activity_type(detected_activity),
    do:
      detected_activity
      |> ActivityCatalog.get_activity_type()
      |> Atom.to_string()

  defp get_actor(activity_parser, detected_activity, activity_context),
    do: activity_parser.get_activity_actor(detected_activity, activity_context)

  defp get_metadata(activity_parser, detected_activity, activity_context),
    do: activity_parser.get_activity_metadata(detected_activity, activity_context)

  defp write_log(%{type: activity_type} = entry) do
    case %ActivityLog{}
         |> ActivityLog.changeset(entry)
         |> Repo.insert() do
      {:ok, _} ->
        Logger.info("Logged activity: #{activity_type}")

      {:error, reason} ->
        Logger.error(
          "An error occurred while logging activity: #{activity_type}. Reason: #{inspect(reason)}"
        )
    end
  end
end
