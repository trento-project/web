defmodule TrentoWeb.UserChannel do
  @moduledoc """
  User channel, each user is subscribed to his channel,
  to receive personal broadcasts

  Users can't join other users channel
  """
  require Logger
  use TrentoWeb, :channel

  @impl true
  def join(
        "users:" <> user_id,
        _payload,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    user_id = String.to_integer(user_id)

    if user_id == current_user_id do
      {:ok, socket}
    else
      Logger.error(
        "Could not join user channel, requested user id: #{user_id}, authenticated user id: #{current_user_id}"
      )

      {:error, :unauthorized}
    end
  end

  def join("users:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end
end
