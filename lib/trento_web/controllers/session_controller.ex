defmodule TrentoWeb.SessionController do
  alias Trento.Repo
  alias Trento.User

  use TrentoWeb, :controller

  action_fallback TrentoWeb.FallbackController

  def create(conn, credentials) do
    with {:ok, conn} <- conn |> Pow.Plug.authenticate_user(credentials) do
      render(conn, "logged.json", token: conn.private[:api_access_token])
    else
      {:error, _conn} ->
        {:error, {:unauthorized}}
    end
  end

  def show(conn, _) do
    user_id = conn.private[:user_id]
    user = Repo.get_by!(User, id: user_id)

    IO.inspect(user)
    conn
    |> json(%{})
  end
end
