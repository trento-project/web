defmodule TrentoWeb.V1.ActivityLogJSON do
  alias Trento.ActivityLog.Policy
  alias Trento.Users.User

  def activity_log(%{activity_log: entries, pagination: meta, current_user: user}),
    do: %{
      data: Enum.map(entries, &activity_log_entry(%{activity_log_entry: &1, current_user: user})),
      pagination: pagination(%{pagination: meta})
    }

  def activity_log_entry(%{activity_log_entry: entry, current_user: user}),
    do: %{
      id: entry.id,
      type: entry.type,
      actor: maybe_redact_actor(entry.actor, user),
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

  defp maybe_redact_actor(actor, %User{username: actor}), do: actor

  defp maybe_redact_actor("system" = actor, _), do: actor

  defp maybe_redact_actor(actor, user) do
    if Policy.has_access_to_users?(user) do
      actor
    else
      "••••••••"
    end
  end
end
