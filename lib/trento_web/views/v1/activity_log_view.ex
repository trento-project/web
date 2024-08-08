defmodule TrentoWeb.V1.ActivityLogView do
  use TrentoWeb, :view

  def render("activity_log.json", %{activity_log: entries, pagination: meta}) do
    %{
      data: render_many(entries, __MODULE__, "activity_log_entry.json", as: :activity_log_entry),
      pagination: render_one(meta, __MODULE__, "pagination.json", pagination: meta)
    }
  end

  def render("activity_log_entry.json", %{activity_log_entry: entry}) do
    %{
      id: entry.id,
      type: entry.type,
      actor: entry.actor,
      metadata: entry.metadata,
      # Time of occurrence approximated by time of insertion in DB.
      occurred_on: entry.inserted_at
    }
  end

  def render("pagination.json", %{pagination: pagination}) do
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
