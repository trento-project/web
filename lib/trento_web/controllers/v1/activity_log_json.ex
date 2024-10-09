defmodule TrentoWeb.V1.ActivityLogJSON do
  def activity_log(%{activity_log: entries, pagination: meta}),
    do: %{
      data: Enum.map(entries, &activity_log_entry(%{activity_log_entry: &1})),
      pagination: pagination(%{pagination: meta})
    }

  def activity_log_entry(%{activity_log_entry: entry}),
    do: %{
      id: entry.id,
      type: entry.type,
      actor: entry.actor,
      metadata: entry.metadata,
      # Time of occurrence approximated by time of insertion in DB.
      occurred_on: entry.inserted_at
    }

  defp pagination(%{pagination: pagination}) do
    %{
      end_cursor: end_cursor,
      start_cursor: start_cursor,
      has_next_page?: has_next_page,
      has_previous_page?: has_previous_page,
      flop: %{
        first: first,
        last: last
      }
    } =
      pagination

    %{
      start_cursor: start_cursor,
      end_cursor: end_cursor,
      first: first,
      last: last,
      has_next_page: has_next_page,
      has_previous_page: has_previous_page
    }
  end
end
