defmodule TrentoWeb.Plugs.LoadUserPlug do
  @moduledoc """
  LoadUserPlug loads the stateless user from jwt from the database.
  The current user is replaced with the stateful user for subsequent plugs
  """
  require Logger
  alias Trento.Users

  def init(opts), do: opts

  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(conn, _handler) do
    config = Pow.Plug.fetch_config(conn)
    %{"user_id" => user_id} = Pow.Plug.current_user(conn, config)

    {:ok, user} = Users.get_user(user_id)

    Pow.Plug.assign_current_user(conn, user, config)
  end
end
