defmodule TrentoWeb.SessionJSON do
  def logged(%{token: token, expiration: expiration, refresh_token: refresh_token}),
    do: %{access_token: token, expires_in: expiration, refresh_token: refresh_token}

  def refreshed(%{token: token, expiration: expiration}),
    do: %{access_token: token, expires_in: expiration}

  def me(%{user: %{username: username, id: id}}),
    do: %{
      username: username,
      id: id
    }
end
