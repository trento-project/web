defmodule TrentoWeb.V1.ActivityLogView do
  use TrentoWeb, :view

  def render("activity_log.json", %{activity_log: entries}) do
    render_many(entries, __MODULE__, "activity_log_entry.json", as: :entries)
  end

  def render("activity_log_entry.json", %{entries: entry}) do
    %{
      type: entry.type,
      actor: entry.actor,
      metadata: entry.metadata,
      # Time of occurence approximated by time of insertion in DB.
      occured_on: entry.inserted_at
    }
  end
end
