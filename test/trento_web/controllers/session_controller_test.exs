defmodule TrentoWeb.SessionControllerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false

  import Mox
  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.Auth.RefreshToken
  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.Users
  alias Trento.Users.User

  alias TrentoWeb.Auth.AssentSamlStrategy

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    user =
      %User{}
      |> User.changeset(%{
        username: "trento_user",
        password: "testpassword",
        confirm_password: "testpassword",
        email: "test@trento.com",
        fullname: "Full Name"
      })
      |> Trento.Repo.insert!()

    api_spec = ApiSpec.spec()

    {:ok, user: user, api_spec: api_spec}
  end

  describe "refresh endpoint" do
    test "should return unauthorized when the refresh token is valid but the user has been deleted",
         %{
           conn: conn,
           user: user
         } do
      {:ok, _} = Trento.Users.delete_user(user)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        5,
        fn ->
          1_671_641_814
        end
      )

      refresh_token = RefreshToken.generate_and_sign!(%{"sub" => user.id})

      conn =
        post(conn, "/api/session/refresh", %{
          "refresh_token" => refresh_token
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid refresh token.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return unauthorized when the refresh token is valid but the user has been locked",
         %{
           conn: conn,
           user: user
         } do
      {:ok, _} = Trento.Users.update_user(user, %{enabled: false})

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        5,
        fn ->
          1_671_641_814
        end
      )

      refresh_token = RefreshToken.generate_and_sign!(%{"sub" => user.id})

      conn =
        post(conn, "/api/session/refresh", %{
          "refresh_token" => refresh_token
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid refresh token.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return refreshed credentials for the user when the refresh token is valid", %{
      conn: conn,
      api_spec: api_spec,
      user: user
    } do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        8,
        fn ->
          1_671_641_814
        end
      )

      refresh_token = RefreshToken.generate_and_sign!(%{"sub" => user.id})

      conn =
        post(conn, "/api/session/refresh", %{
          "refresh_token" => refresh_token
        })

      conn
      |> json_response(200)
      |> assert_schema("RefreshedCredentials", api_spec)
    end

    test "should return unauthorized if the refresh token signature is invalid", %{conn: conn} do
      bad_refresh =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY2MzQxNCwiaWF0IjoxNjcxNjQxODE0LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwaTNzMGZzNmZqcHE5dnVrMDAwNWUxIiwibmJmIjoxNjcxNjQxODE0LCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ._ec0RJEiL4yMWvK0ibVJ_uTgzcgs3VRLr2JrZZLWsjQ"

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session/refresh", %{
          "refresh_token" => bad_refresh
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid refresh token.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return unauthorized if the refresh token signature is malformed", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session/refresh", %{
          "refresh_token" => "malformed"
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid refresh token.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return unauthorized if the refresh token is valid but expired", %{conn: conn} do
      expired_jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBwIiwiZXhwIjoxNjcxNjYzNDE0LCJpYXQiOjE2NzE2NDE4MTQsImlzcyI6Imh0dHBzOi8vZ2l0aHViLmNvbS90cmVudG8tcHJvamVjdC93ZWIiLCJqdGkiOiIyc3BpM3MwZnM2ZmpwcTl2dWswMDA1ZTEiLCJuYmYiOjE2NzE2NDE4MTQsInN1YiI6MSwidHlwIjoiUmVmcmVzaCJ9.73ajWvgUml4F4Ml5rACyUeAlipknOUdQFy6t8tYZf5Y"

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        1,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session/refresh", %{
          "refresh_token" => expired_jwt
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid refresh token.", "title" => "Unauthorized"}]} =
               resp
    end
  end

  describe "me endpoint" do
    test "should return the logged user based on the token", %{
      conn: conn,
      api_spec: api_spec,
      user: user
    } do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        5,
        fn ->
          1_671_715_992
        end
      )

      good_jwt = TrentoWeb.Auth.AccessToken.generate_access_token!(%{"sub" => user.id})

      resp =
        conn
        |> Plug.Conn.put_req_header("authorization", good_jwt)
        |> get("/api/me")
        |> json_response(200)
        |> assert_schema("TrentoUser", api_spec)

      user_id = user.id
      assert %{username: "trento_user", id: ^user_id} = resp
    end
  end

  describe "login endpoint" do
    test "should return the user tokens when the credentials are valid", %{
      conn: conn,
      api_spec: api_spec
    } do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "testpassword"
        })

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)
    end

    test "should return unauthorized response when the credentials are of a deleted user", %{
      conn: conn,
      user: user
    } do
      {:ok, _} = Trento.Users.delete_user(user)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "tespassword"
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid credentials.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return unauthorized response when the credentials are of a locked user", %{
      conn: conn,
      user: user
    } do
      {:ok, _} = Trento.Users.update_user(user, %{enabled: false})

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "tespassword"
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid credentials.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return unauthorized response when the credentials are invalid", %{
      conn: conn
    } do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "testpassword2"
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid credentials.", "title" => "Unauthorized"}]} =
               resp
    end

    test "should return totp code missing if the code is not provided", %{
      conn: conn,
      user: user
    } do
      {:ok, _} =
        user
        |> User.totp_update_changeset(%{totp_enabled_at: DateTime.utc_now()})
        |> Trento.Repo.update()

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "testpassword"
        })

      resp = json_response(conn, 422)

      assert %{
               "errors" => [
                 %{"detail" => "TOTP code missing.", "title" => "Unprocessable Entity"}
               ]
             } =
               resp
    end

    test "should validate totp correctly", %{
      conn: conn,
      user: user,
      api_spec: api_spec
    } do
      secret = NimbleTOTP.secret()
      totp_code = NimbleTOTP.verification_code(secret)

      {:ok, _} =
        user
        |> User.totp_update_changeset(%{
          totp_enabled_at: DateTime.utc_now(),
          totp_secret: secret,
          totp_last_used_at: nil
        })
        |> Trento.Repo.update()

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "testpassword",
          "totp_code" => totp_code
        })

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)
    end

    test "should return 501 if external IDP integration is enabled", %{conn: conn} do
      Application.put_env(:trento, :oidc, enabled: true)

      conn =
        post(conn, "/api/session", %{
          "username" => "trento_user",
          "password" => "testpassword"
        })

      json_response(conn, 501)

      Application.put_env(:trento, :oidc, enabled: false)
    end
  end

  describe "callback endpoint" do
    defmodule TestProvider do
      @moduledoc false
      @behaviour Assent.Strategy

      @impl true
      def authorize_url(config) do
        case config[:error] do
          nil ->
            {:ok, %{url: "https://provider.example.com/oauth/authorize", session_params: %{a: 1}}}

          error ->
            {:error, error}
        end
      end

      @impl true
      def callback(config, _params) do
        user = Keyword.get(config, :test_user)

        {:ok,
         %{
           uid: user.username,
           user: %{
             "sub" => user.username,
             "sid" => user.id,
             "email" => user.email,
             "username" => user.username
           },
           token: %{"access_token" => "access_token"}
         }}
      end
    end

    setup %{conn: conn} = context do
      conn =
        conn
        |> Plug.Conn.put_private(:plug_session, %{})
        |> Plug.Conn.put_private(:plug_session_fetch, :done)
        |> Pow.Plug.put_config(otp_app: :trento)

      Map.put(context, :conn, conn)
    end

    test "should return the credentials when the sso callback flow is completed without errors and the user does not exist on trento",
         %{conn: conn, api_spec: api_spec} do
      user = build(:user)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: TestProvider, test_user: user]
        ]
      )

      valid_params = %{"code" => "valid", "session_params" => %{"a" => 1}}

      conn = post(conn, ~p"/api/session/test_provider/callback?#{valid_params}")

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)
    end

    test "should return the credentials when the sso callback flow is completed without errors and the user exists on trento but without an associated user identity",
         %{conn: conn, api_spec: api_spec} do
      user = insert(:user)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: TestProvider, test_user: user]
        ]
      )

      valid_params = %{"code" => "valid", "session_params" => %{"a" => 1}}

      conn = post(conn, ~p"/api/session/test_provider/callback?#{valid_params}")

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)
    end

    test "should return the credentials when the sso callback flow is completed without errors and the user does exist on trento",
         %{conn: conn, api_spec: api_spec} do
      user = insert(:user)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: TestProvider, test_user: user]
        ]
      )

      valid_params = %{"code" => "valid", "session_params" => %{"a" => 1}}

      conn =
        conn
        |> Pow.Plug.assign_current_user(user, Pow.Plug.fetch_config(conn))
        |> post(~p"/api/session/test_provider/callback?#{valid_params}")

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)
    end

    test "should return the credentials when the sso callback flow is completed without errors and assign the global abilities when the oidc user is the default admin and does not exists on trento",
         %{conn: conn, api_spec: api_spec} do
      %{username: username} = user = build(:user)
      Application.put_env(:trento, :admin_user, username)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: TestProvider, test_user: user]
        ]
      )

      valid_params = %{"code" => "valid", "session_params" => %{"a" => 1}}

      conn = post(conn, ~p"/api/session/test_provider/callback?#{valid_params}")

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)

      %User{id: user_id} = Users.get_by(username: username)
      {:ok, %User{abilities: abilities}} = Users.get_user(user_id)
      assert [%{id: 1}] = abilities

      Application.put_env(:trento, :admin_user, "admin")
    end

    test "should return the credentials when the sso callback flow is completed without errors and assign the global abilities when the oidc user is the default admin and already exists on trento",
         %{conn: conn, api_spec: api_spec} do
      %{username: username, id: user_id} = user = insert(:user)
      Application.put_env(:trento, :admin_user, username)

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: TestProvider, test_user: user]
        ]
      )

      valid_params = %{"code" => "valid", "session_params" => %{"a" => 1}}

      conn =
        conn
        |> Pow.Plug.assign_current_user(user, Pow.Plug.fetch_config(conn))
        |> post(~p"/api/session/test_provider/callback?#{valid_params}")

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)

      {:ok, %User{abilities: abilities}} = Users.get_user(user_id)
      assert [%{id: 1}] = abilities

      Application.put_env(:trento, :admin_user, "admin")
    end

    test "should return unauthorized when the sso callback flow is completed without errors and the user is locked on trento",
         %{conn: conn, api_spec: api_spec} do
      user = insert(:user, locked_at: DateTime.utc_now())

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: TestProvider, test_user: user]
        ]
      )

      valid_params = %{"code" => "valid", "session_params" => %{"a" => 1}}

      conn =
        conn
        |> Pow.Plug.assign_current_user(user, Pow.Plug.fetch_config(conn))
        |> post(~p"/api/session/test_provider/callback?#{valid_params}")

      conn
      |> json_response(401)
      |> assert_schema("Unauthorized", api_spec)
    end

    test "should return the credentials when the saml callback flow is completed without errors and the user does not exist on trento",
         %{conn: conn, api_spec: api_spec} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      Samly.State.init(Samly.State.ETS)

      username = Faker.Internet.user_name()

      not_on_or_after =
        DateTime.utc_now()
        |> DateTime.add(8, :hour)
        |> DateTime.to_iso8601()

      assertion = %Samly.Assertion{
        subject: %{notonorafter: not_on_or_after},
        attributes: %{
          "username" => username,
          "email" => Faker.Internet.email(),
          "firstName" => Faker.Person.first_name(),
          "lastName" => Faker.Person.last_name()
        }
      }

      assertion_key = {"idp1", "name1"}

      conn =
        conn
        |> Samly.State.put_assertion(assertion_key, assertion)
        |> put_session("samly_assertion_key", assertion_key)

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: AssentSamlStrategy]
        ]
      )

      conn = get(conn, ~p"/api/session/test_provider/saml_callback")

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)

      %User{} = Users.get_by(username: username)
    end

    test "should return unauthorized in saml callback flow when assertion is missing",
         %{conn: conn, api_spec: api_spec} do
      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: AssentSamlStrategy]
        ]
      )

      conn = get(conn, ~p"/api/session/test_provider/saml_callback")

      conn
      |> json_response(401)
      |> assert_schema("Unauthorized", api_spec)
    end

    test "should return unauthorized in saml callback flow when user attributes are missing",
         %{conn: conn, api_spec: api_spec} do
      Samly.State.init(Samly.State.ETS)

      not_on_or_after =
        DateTime.utc_now()
        |> DateTime.add(8, :hour)
        |> DateTime.to_iso8601()

      assertion = %Samly.Assertion{
        subject: %{notonorafter: not_on_or_after},
        attributes: %{}
      }

      assertion_key = {"idp1", "name1"}

      conn =
        conn
        |> Samly.State.put_assertion(assertion_key, assertion)
        |> put_session("samly_assertion_key", assertion_key)

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          test_provider: [strategy: AssentSamlStrategy]
        ]
      )

      conn = get(conn, ~p"/api/session/test_provider/saml_callback")

      conn
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end
end
