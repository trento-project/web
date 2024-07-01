defmodule TrentoWeb.Plugs.LoadUserPlug do
  @moduledoc """
  LoadUserPlug loads the stateless user from jwt from the database.
  The current user is replaced with the stateful user for subsequent plugs
  """
  require Logger
  alias Trento.Users
  alias Trento.Users.User

  def init(opts), do: opts

  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(conn, _handler) do
    config = Pow.Plug.fetch_config(conn)

    case detect_current_user(conn, config) do
      %User{} = user ->
        Pow.Plug.assign_current_user(conn, user, config)

      nil ->
        conn
    end
  end

  defp detect_current_user(conn, config) do
    case Pow.Plug.current_user(conn, config) do
      %{"user_id" => user_id} ->
        {:ok, user} = Users.get_user(user_id)
        user

      %User{} = user ->
        user

      nil ->
        nil
    end
  end
end
