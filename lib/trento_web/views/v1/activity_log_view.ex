defmodule TrentoWeb.V1.ActivityLogView do
  use TrentoWeb, :view

  def render("activity_log.json", %{activity_log: entries}) do
    render_many(entries, __MODULE__, "activity_log_entry.json", as: :activity_log_entry)
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
end
