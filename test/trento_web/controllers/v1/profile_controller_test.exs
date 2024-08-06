defmodule TrentoWeb.V1.ProfileControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Trento.Factory
  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup %{conn: conn} do
    # admin user to avoid forbidden error
    insert(:user)
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

  test "should disable write profile action when external idp integration is enabled", %{
    conn: conn
  } do
    Application.put_env(:trento, :oidc, enabled: true)

    conn = put_req_header(conn, "content-type", "application/json")

    Enum.each(
      [
        patch(conn, "/api/v1/profile", %{}),
        get(conn, "/api/v1/profile/totp_enrollment"),
        post(conn, "/api/v1/profile/totp_enrollment", %{}),
        delete(conn, "/api/v1/profile/totp_enrollment")
      ],
      fn conn ->
        json_response(conn, 501)
      end
    )

    Application.put_env(:trento, :oidc, enabled: false)
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

  test "should get totp enrollment data when totp is not configured for the user", %{
    conn: conn,
    api_spec: api_spec
  } do
    conn
    |> put_req_header("content-type", "application/json")
    |> get("/api/v1/profile/totp_enrollment")
    |> json_response(:ok)
    |> assert_schema("UserTOTPEnrollmentPayload", api_spec)
  end

  test "should get an error when requesting totp enrollment data for an already totp enrolled user",
       %{
         conn: conn,
         api_spec: api_spec
       } do
    enrolled_user =
      insert(:user, %{
        totp_enabled_at: DateTime.utc_now(),
        totp_secret: Faker.Internet.domain_name(),
        totp_last_used_at: DateTime.utc_now()
      })

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => enrolled_user.id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> get("/api/v1/profile/totp_enrollment")
    |> json_response(:unprocessable_entity)
    |> assert_schema("UnprocessableEntity", api_spec)
  end

  test "should return forbidden if the totp enrollment is requested for default admin", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: user_id} = insert(:user, username: admin_username())

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => user_id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> get("/api/v1/profile/totp_enrollment")
    |> json_response(:forbidden)
    |> assert_schema("Forbidden", api_spec)
  end

  test "should not reset totp when a reset is requested for the default admin", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: user_id} = insert(:user, username: admin_username())

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => user_id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> delete("/api/v1/profile/totp_enrollment")
    |> json_response(:forbidden)
    |> assert_schema("Forbidden", api_spec)
  end

  test "should reset totp enrollment for a user", %{
    conn: conn
  } do
    conn
    |> put_req_header("content-type", "application/json")
    |> delete("/api/v1/profile/totp_enrollment")
    |> response(:no_content)
  end

  test "should not confirm a totp enrollment for the default admin", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: user_id} = insert(:user, username: admin_username())

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => user_id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/v1/profile/totp_enrollment", %{totp_code: "12345"})
    |> json_response(:forbidden)
    |> assert_schema("Forbidden", api_spec)
  end

  test "should not confirm a totp enrollment if totp is already enabled for the user", %{
    conn: conn,
    api_spec: api_spec
  } do
    enrolled_user =
      insert(:user, %{
        totp_enabled_at: DateTime.utc_now(),
        totp_secret: Faker.Internet.domain_name(),
        totp_last_used_at: DateTime.utc_now()
      })

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => enrolled_user.id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/v1/profile/totp_enrollment", %{totp_code: "12345"})
    |> json_response(:unprocessable_entity)
    |> assert_schema("UnprocessableEntity", api_spec)
  end

  test "should not confirm a totp enrollment if totp is not valid", %{
    conn: conn,
    api_spec: api_spec
  } do
    enrolled_user =
      insert(:user, %{
        totp_secret: Faker.Internet.domain_name()
      })

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => enrolled_user.id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/v1/profile/totp_enrollment", %{totp_code: "12345"})
    |> json_response(:unprocessable_entity)
    |> assert_schema("UnprocessableEntity", api_spec)
  end

  test "should confirm a totp enrollment if totp is valid for the enrollment", %{
    conn: conn,
    api_spec: api_spec
  } do
    secret = NimbleTOTP.secret()

    enrolled_user =
      insert(:user, %{
        totp_secret: secret
      })

    conn =
      Pow.Plug.assign_current_user(
        conn,
        %{"user_id" => enrolled_user.id},
        Pow.Plug.fetch_config(conn)
      )

    conn
    |> put_req_header("content-type", "application/json")
    |> post("/api/v1/profile/totp_enrollment", %{totp_code: NimbleTOTP.verification_code(secret)})
    |> json_response(:ok)
    |> assert_schema("UserTOTPEnrollmentConfirmPayload", api_spec)
  end

  defp admin_username, do: Application.fetch_env!(:trento, :admin_user)
end
