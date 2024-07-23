defmodule Trento.ActivityLog.ActivityLogger do
  @moduledoc """
  ActivityLogger entry point
  """

  alias Trento.Repo

  alias Trento.ActivityLog.ActivityCatalog
  alias Trento.ActivityLog.ActivityLog
  alias Trento.ActivityLog.Parser.ActivityParser

  require Logger

  def log_activity(activity_context) do
    with detected_activity <- ActivityCatalog.detect_activity(activity_context),
         true <- ActivityCatalog.interested?(detected_activity, activity_context),
         {:ok, log_entry} <- ActivityParser.to_activity_log(detected_activity, activity_context) do
      write_log(log_entry)
    end

    :ok
  end

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
