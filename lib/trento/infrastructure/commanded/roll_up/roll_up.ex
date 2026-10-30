# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Commanded.RollUp.RollUp do
  @moduledoc """
  This module is responsible for archiving a stream and appending a roll-up event to it.

  This is done in a transaction to ensure that the stream is archived and the roll-up event is appended atomically.
  Archived events are removed from the $all stream but they are still available in the original stream.
  """

  import Trento.Infrastructure.Commanded.RollUp.Queries

  require Logger

  def roll_up_aggregate(stream_id, roll_up_event, stream_archive_id) do
    # A dedicated connection is needed because hard deletes are enabled at session level,
    # so it must not be shared with the EventStore pool. It is stopped afterwards to avoid
    # leaking connections, as the caller is a long-lived event handler.
    {:ok, pid} =
      Trento.EventStore.config()
      |> Keyword.put(:pool_size, 1)
      |> Postgrex.start_link()

    try do
      case Postgrex.transaction(pid, &do_rollup(stream_id, roll_up_event, stream_archive_id, &1)) do
        {:ok, :ok} ->
          Logger.info("Aggregate rolled-up: #{stream_id} -> #{stream_archive_id}")

          :ok

        {:error, reason} = error ->
          Logger.error(
            "Error while rolling up aggregate: #{stream_id}, roll-up event: #{inspect(roll_up_event)}, error: #{inspect(reason)}",
            error: reason
          )

          error
      end
    after
      GenServer.stop(pid)
    end
  end

  defp do_rollup(stream_id, roll_up_event, stream_archive_id, conn) do
    with :ok <- Trento.EventStore.delete_snapshot(stream_id, conn: conn),
         :ok <- archive_stream(conn, stream_id, stream_archive_id) do
      append_roll_up_event(conn, roll_up_event, stream_id)
    end
  end

  defp archive_stream(conn, stream_id, stream_archive_id) do
    with {:ok, _} <- enable_hard_deletes(conn),
         {:ok, _} <- remove_events_from_all_stream(conn, stream_id),
         {:ok, _} <- update_stream_id(conn, stream_id, stream_archive_id) do
      :ok
    end
  end

  defp append_roll_up_event(conn, roll_up_event, stream_id) do
    event_data = %EventStore.EventData{
      causation_id: UUID.uuid4(),
      correlation_id: UUID.uuid4(),
      event_type: Commanded.EventStore.TypeProvider.to_string(roll_up_event),
      data: roll_up_event,
      metadata: %{}
    }

    Trento.EventStore.append_to_stream(
      stream_id,
      :any_version,
      [event_data],
      conn: conn
    )
  end
end
