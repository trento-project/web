defmodule Trento.RollUp.Queries do
  @moduledoc """
  This module contains the SQL queries used to archive a stream.
  """

  def enable_hard_deletes(conn) do
    Postgrex.query(conn, "SET SESSION eventstore.enable_hard_deletes TO 'on';", [])
  end

  def remove_events_from_all_stream(conn, stream_id) do
    Postgrex.query(
      conn,
      "DELETE FROM stream_events USING streams WHERE streams.stream_id=stream_events.original_stream_id AND streams.stream_uuid='#{stream_id}' AND stream_events.stream_id = 0;",
      []
    )
  end

  def update_stream_id(conn, old_stream_id, new_stream_id) do
    Postgrex.query(
      conn,
      "UPDATE streams SET stream_uuid = '#{new_stream_id}' WHERE stream_uuid = '#{old_stream_id}';",
      []
    )
  end
end
