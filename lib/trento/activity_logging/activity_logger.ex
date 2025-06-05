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
    with {:ok, detected_activity} <- ActivityCatalog.detect_activity(activity_context),
         {:ok, log_entry} <- ActivityParser.to_activity_log(detected_activity, activity_context) do
      write_log(log_entry, maybe_get_request_id(activity_context))
    end

    :ok
  end

  defp maybe_get_request_id(activity_context) do
    activity_context.assigns.plug_request_id
  rescue
    _ -> nil
  end

  defp write_log(%{type: activity_type} = entry, request_id) do
    case %ActivityLog{}
         |> ActivityLog.changeset(entry)
         |> Repo.insert() do
      {:ok, entry} ->
        causation_id = entry.metadata[:causation_id]
        correlation_id = entry.metadata[:correlation_id]

        case {correlation_id, causation_id} do
          {nil, nil} ->
            # case of user entry in activity log, for instance

            _ =
              %{
                entry_id: entry.id,
                causation_id: UUID.uuid4(),
                correlation_id: UUID.uuid4(),
                request_id: request_id
              }
              |> Trento.ActivityLog.ActivityLinkerWorker.new()
              |> Oban.insert()

            Logger.info("Logged activity: #{activity_type}")
            {:ok, entry.id}

          {correlation_id, causation_id}
          when is_binary(correlation_id) and is_binary(causation_id) ->
            # case of domain event in activity log
            _ =
              %{entry_id: entry.id, causation_id: causation_id, correlation_id: correlation_id}
              |> Trento.ActivityLog.ActivityLinkerWorker.new()
              |> Oban.insert()

            Logger.info("Logged activity: #{activity_type}")
            {:ok, entry.id}
        end

      {:error, reason} ->
        Logger.error(
          "An error occurred while logging activity: #{activity_type}. Reason: #{inspect(reason)}"
        )

        :error
    end
  end
end
