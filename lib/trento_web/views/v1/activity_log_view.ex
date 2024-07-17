defmodule TrentoWeb.V1.ActivityLogView do
  use TrentoWeb, :view

  def render("activity_log.json", %{activity_log: entries, pagination: meta}) do
    %{
      data: render_many(entries, __MODULE__, "activity_log_entry.json", as: :entries),
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

  def render("pagination.json", %{pagination: pagination}) when is_map(pagination) do
    %{
      end_cursor: end_cursor,
      start_cursor: start_cursor,
      flop: %{
        first: first,
        last: last,
        order_by: order_by,
        order_directions: order_directions,
        filters: filters
      }
    } =
      pagination

    %{
      start_cursor: start_cursor,
      end_cursor: end_cursor,
      first: first,
      last: last,
      filters: Enum.map(filters, &Map.from_struct(&1)),
      order_by: order_by,
      order_directions: order_directions
    }
  end
end
