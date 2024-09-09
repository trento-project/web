defmodule TrentoWeb.ActivityLogChannel do
  @moduledoc """
  Activity Log channel, each user is subscribed to this channel,

  """
  require Logger
  use TrentoWeb, :channel
  alias Trento.Users

  @impl true
  def join(
        "activity_log:" <> user_id,
        _payload,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    if allowed?(user_id, current_user_id) do
      send(self(), :after_join)
      {:ok, socket}
    else
      Logger.error(
        "Could not join activity_log channel, requested user id: #{user_id}, authenticated user id: #{current_user_id}"
      )

      {:error, :unauthorized}
    end
  end

  def join("activity_log:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  @impl true
  def handle_info(:after_join, socket) do
    all_usernames = Users.list_all_usernames()
    collapsed_usernames = collapse_usernames(all_usernames)

    users = ["system" | collapsed_usernames]
    push(socket, "al_users_pushed", %{users: users})
    Process.send_after(self(), :after_join, 60_000)
    {:noreply, socket}
  end

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  defp collapse_usernames(usernames) do
    usernames
    |> Enum.map(fn username ->
      maybe_ts =
        username
        |> String.split("__")
        |> List.last()

      case DateTime.from_iso8601(maybe_ts) do
        {:ok, _, _} ->
          String.trim_trailing(username, "__" <> maybe_ts)

        _ ->
          username
      end
    end)
    |> Enum.uniq()
  end
end
