defmodule TrentoWeb.V1.ProfileControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Trento.Factory
  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup %{conn: conn} do
    user = insert(:user)

    conn =
      conn
      |> Plug.Conn.put_private(:plug_session, %{})
      |> Plug.Conn.put_private(:plug_session_fetch, :done)
      |> Pow.Plug.put_config(otp_app: :trento)

    api_spec = ApiSpec.spec()

    conn =
      Pow.Plug.assign_current_user(conn, %{"user_id" => user.id}, Pow.Plug.fetch_config(conn))

    {:ok,
     conn: put_req_header(conn, "accept", "application/json"), api_spec: api_spec, user: user}
  end

  test "should show the current user profile", %{
    user: %{id: user_id},
    conn: conn,
    api_spec: api_spec
  } do
    conn = get(conn, "/api/v1/profile")

    resp =
      conn
      |> json_response(200)
      |> assert_schema("UserProfile", api_spec)

    assert %{id: ^user_id} = resp
  end

  test "should update the profile with allowed fields", %{
    conn: conn,
    api_spec: api_spec,
    user: %{id: user_id, password: current_password}
  } do
    %{fullname: fullname, email: email} =
      valid_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        password: "testpassword89",
        current_password: current_password,
        password_confirmation: "testpassword89"
      }

    resp =
      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/profile", valid_params)
      |> json_response(:ok)
      |> assert_schema("UserProfile", api_spec)

    assert %{id: ^user_id, fullname: ^fullname, email: ^email} = resp
  end
end
