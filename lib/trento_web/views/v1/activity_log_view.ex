defmodule TrentoWeb.V1.ActivityLogView do
  use TrentoWeb, :view

  def render("activity_log.json", %{activity_log: entries}) do
    render_many(entries, TrentoWeb.V1.ActivityLogEntryView, "activity_log_entry.json")
  end
end
