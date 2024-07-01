defmodule TrentoWeb.Plugs.LoadUserPlugTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  import Trento.Factory

  alias Trento.Users.User
  alias TrentoWeb.Plugs.LoadUserPlug

  setup do
    conn =
      build_conn()
      |> Plug.Conn.put_private(:plug_session, %{})
      |> Plug.Conn.put_private(:plug_session_fetch, :done)
      |> Pow.Plug.put_config(otp_app: :trento)

    {:ok, conn: conn}
  end

  test "should load the user from the database using the stateless user details", %{conn: conn} do
    %{id: user_id} = insert(:user)
    config = Pow.Plug.fetch_config(conn)
    conn = Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, config)
    conn = LoadUserPlug.call(conn, nil)

    assert %User{id: ^user_id} = Pow.Plug.current_user(conn, config)
  end

  test "should keep an already loaded user details", %{conn: conn} do
    user = insert(:user)
    config = Pow.Plug.fetch_config(conn)
    conn = Pow.Plug.assign_current_user(conn, user, config)
    conn = LoadUserPlug.call(conn, nil)

    assert ^user = Pow.Plug.current_user(conn, config)
  end

  test "should pass through connections without user references", %{conn: conn} do
    config = Pow.Plug.fetch_config(conn)

    conn = LoadUserPlug.call(conn, nil)

    assert nil == Pow.Plug.current_user(conn, config)
  end
end
