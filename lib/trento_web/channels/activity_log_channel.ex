defmodule TrentoWeb.ActivityLogChannel do
  @moduledoc """
  Activity Log channel, each user is subscribed to this channel,

  """
  require Logger
  use TrentoWeb, :channel

  @impl true
  def join(
        "activity_log:" <> user_id,
        _payload,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    user_id = String.to_integer(user_id)

    if user_id == current_user_id do
      send(self(), :after_join)
      {:ok, socket}
    else
      Logger.error(
        "Could not join user channel, requested user id: #{user_id}, authenticated user id: #{current_user_id}"
      )

      {:error, :unauthorized}
    end
  end

  def join("activity_log:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  @impl true
  def handle_info(:after_join, socket) do
    Logger.warning("updates users list")
    push(socket, "al_users_pushed", %{users: ["foo", "bar", "baz", "admin"]})
    Process.send_after(self(), :after_join, 5000)
    {:noreply, socket}
  end
end
