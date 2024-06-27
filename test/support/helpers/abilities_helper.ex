defmodule Trento.Support.Helpers.AbilitiesHelper do
  @moduledoc """
  Helper functions to setup abilities
  """

  import Plug.Conn
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1

  def setup_api_spec_v1(_context) do
    {:ok, api_spec: V1.ApiSpec.spec()}
  end

  def setup_user(%{conn: conn, api_spec: api_spec}) do
    conn =
      conn
      |> Plug.Conn.put_private(:plug_session, %{})
      |> Plug.Conn.put_private(:plug_session_fetch, :done)
      |> Pow.Plug.put_config(otp_app: :trento)

    # Default inject all:all abilities user. ability_id 1 is all:all
    %{id: user_id} = insert(:user)
    insert(:users_abilities, user_id: user_id, ability_id: 1)

    conn =
      Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, Pow.Plug.fetch_config(conn))

    {:ok, conn: put_req_header(conn, "accept", "application/json"), api_spec: api_spec}
  end
end
