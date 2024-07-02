defmodule TrentoWeb.V1.ActivityLogEntryView do
  use TrentoWeb, :view

  def render("activity_log_entry.json", %{activity_log_entry: entry}) do
    %{
      type: entry.type,
      actor: entry.type,
      metadata: entry.metadata,
      inserted_at: entry.inserted_at
    }
  end
end
