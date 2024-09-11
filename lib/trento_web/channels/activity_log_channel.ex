defmodule TrentoWeb.ActivityLogChannel do
  @moduledoc """
  Activity Log channel, each user is subscribed to this channel,

  """
  require Logger
  use TrentoWeb, :channel
  alias Trento.Users
  @refresh_interval Application.compile_env!(:trento, [:activity_log, :refresh_interval])

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
    all_usernames_ts = Users.list_all_usernames_ts()
    collapsed_usernames = collapse_usernames(all_usernames_ts)

    users = ["system" | collapsed_usernames]
    push(socket, "al_users_pushed", %{users: users})
    Process.send_after(self(), :after_join, @refresh_interval)
    {:noreply, socket}
  end

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  defp collapse_usernames(usernames_ts) do
    usernames_ts
    |> Enum.map(fn
      {username, nil} ->
        username

      {username, deleted_at} ->
        String.trim_trailing(username, "__" <> DateTime.to_string(deleted_at))
    end)
    |> Enum.uniq()
  end
end
