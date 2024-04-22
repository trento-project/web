defmodule TrentoWeb.SessionView do
  use TrentoWeb, :view

  def render("logged.json", %{token: token, expiration: expiration, refresh_token: refresh_token}) do
    %{access_token: token, expires_in: expiration, refresh_token: refresh_token}
  end

  def render("refreshed.json", %{token: token, expiration: expiration}) do
    %{access_token: token, expires_in: expiration}
  end

  def render("me.json", %{user: %{username: username, id: id}}) do
    %{
      username: username,
      id: id
    }
  end
end
