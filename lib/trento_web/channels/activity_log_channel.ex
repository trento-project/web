defmodule TrentoWeb.ActivityLogChannel do
  @moduledoc """
  Activity Log channel, each user is subscribed to this channel,

  """
  require Logger
  use TrentoWeb, :channel
  alias Trento.ActivityLog.Policy
  alias Trento.Users
  alias Trento.Users.User

  @refresh_interval Application.compile_env!(:trento, [:activity_log, :refresh_interval])

  @impl true
  def join(
        "activity_log:" <> user_id,
        _payload,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    if allowed?(user_id, current_user_id) do
      send(self(), :after_join)
      {:ok, assign(socket, :current_user, load_current_user(current_user_id))}
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
  def handle_info(
        :after_join,
        %{assigns: %{current_user: %User{} = current_user}} = socket
      ) do
    all_accessible_users = detect_accessible_users(current_user)

    users = ["system" | all_accessible_users]
    push(socket, "al_users_pushed", %{users: users})
    Process.send_after(self(), :after_join, @refresh_interval)
    {:noreply, socket}
  end

  def handle_info(:after_join, socket), do: {:noreply, socket}

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  defp load_current_user(user_id) do
    case Users.get_user(user_id) do
      {:ok, user} -> user
      _ -> nil
    end
  end

  defp detect_accessible_users(%User{username: current_username} = current_user) do
    if Policy.has_access_to_users?(current_user) do
      Enum.map(Users.list_users(), & &1.username)
    else
      [current_username]
    end
  end
end
