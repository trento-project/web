defmodule TrentoWeb.V1.UserController do
  use TrentoWeb, :controller

  alias Trento.Users
  alias Trento.Users.User

  action_fallback TrentoWeb.FallbackController

  def index(conn, _params) do
    cu = Pow.Plug.current_user(conn)
    # dbg()
    users = Users.list_users()
    render(conn, "index.json", users: users)
  end

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Users.create_user(user_params) do
      conn
      |> put_status(:created)
      |> render("show.json", user: user)
    end
  end

  def show(conn, %{"id" => id}) do
    with {:ok, user} <- Users.get_user(id) do
      render(conn, "show.json", user: user)
    end
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    with {:ok, user} <- Users.get_user(id),
         {:ok, %User{} = user} <- Users.update_user(user, user_params) do
      render(conn, "show.json", user: user)
    end
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, user} <- Users.get_user(id),
         {:ok, %User{}} <- Users.delete_user(user) do
      send_resp(conn, :no_content, "")
    end
  end
end
