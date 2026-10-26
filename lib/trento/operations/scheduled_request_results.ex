# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.ScheduledRequestResults do
  @moduledoc """
  Records the answers of Wanda to scheduled operation requests.

  Wanda refuses a request when another operation runs on the same target and
  replies with OperationCompleted REQUEST_FAILED/ALREADY_RUNNING. When the
  request came from a schedule, this is a failed scheduled request: it is
  logged as such, correlated to the schedule.
  """

  alias Trento.ActivityLog
  alias Trento.ActivityLog.SeverityLevel
  alias Trento.ActivityLog.ActivityLog, as: Entry
  alias Trento.Operations.V1.{OperationCompleted, OperationRequestFailedDetails}
  alias Trento.Repo

  @spec record(struct()) :: :ok
  def record(%OperationCompleted{
        operation_id: operation_id,
        details:
          {:request_failed_details, %OperationRequestFailedDetails{error: :ALREADY_RUNNING}}
      }) do
    case ActivityLog.list_activity_log(%{
           type: "scheduled_operation_requested",
           search: operation_id
         }) do
      {:ok, [%{metadata: metadata}], _meta} -> log_refusal(metadata)
      _ -> :ok
    end
  end

  def record(_), do: :ok

  defp log_refusal(request_metadata) do
    type = "scheduled_operation_request_failed"
    metadata = Map.put(request_metadata, "reason", "already_running")

    %Entry{}
    |> Entry.changeset(%{
      type: type,
      actor: "system",
      metadata: metadata,
      severity:
        type
        |> SeverityLevel.map_severity_level(metadata)
        |> SeverityLevel.severity_level_to_integer()
    })
    |> Repo.insert!()

    :ok
  end
end
