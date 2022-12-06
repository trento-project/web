defmodule TrentoWeb.SessionController do
  use TrentoWeb, :controller

  action_fallback TrentoWeb.FallbackController

  def new(conn, _args) do
    render(conn, "new.html")
  end

  def create(conn, credentials) do
    with {:ok, conn} <- conn |> Pow.Plug.authenticate_user(credentials) do
      render(conn, "logged.json", token: conn.private[:api_access_token])
    else
      {:error, _conn} ->
        {:error, {:unauthorized}}
    end
  end
end
