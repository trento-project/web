# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.SessionControllerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use TrentoWeb.TokensCase

  import Mox
  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.Auth.RefreshToken
  alias TrentoWeb.OpenApi.Unversioned.ApiSpec

  alias Trento.Users
  alias Trento.Users.User

  alias TrentoWeb.Auth.AssentSamlStrategy
  alias TrentoWeb.Auth.FakeIdentityProvider

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
      |> assert_schema("RefreshedCredentialsV1", api_spec)
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
      |> assert_schema("CredentialsV1", api_spec)
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
      |> assert_schema("CredentialsV1", api_spec)
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

      valid_params = %{"code" => "valid", "state" => "state"}

      conn = post_callback(conn, valid_params, "test_provider")

      conn
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
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

      valid_params = %{"code" => "valid", "state" => "state"}

      conn = post_callback(conn, valid_params, "test_provider")

      conn
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
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

      valid_params = %{"code" => "valid", "state" => "state"}

      conn =
        conn
        |> Pow.Plug.assign_current_user(user, Pow.Plug.fetch_config(conn))
        |> post_callback(valid_params, "test_provider")

      conn
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
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

      valid_params = %{"code" => "valid", "state" => "state"}

      conn = post_callback(conn, valid_params, "test_provider")

      conn
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)

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

      valid_params = %{"code" => "valid", "state" => "state"}

      conn =
        conn
        |> Pow.Plug.assign_current_user(user, Pow.Plug.fetch_config(conn))
        |> post_callback(valid_params, "test_provider")

      conn
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)

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

      valid_params = %{"code" => "valid", "state" => "state"}

      conn =
        conn
        |> Pow.Plug.assign_current_user(user, Pow.Plug.fetch_config(conn))
        |> post_callback(valid_params, "test_provider")

      conn
      |> json_response(401)
      |> assert_schema("UnauthorizedV1", api_spec)
    end
  end

  describe "callback endpoint state verification" do
    setup do
      oauth2_config = Application.fetch_env!(:trento, :oauth2)
      pow_assent_config = Application.fetch_env!(:trento, :pow_assent)

      Application.put_env(:trento, :oauth2,
        enabled: true,
        callback_url: "http://localhost:4000/auth/oauth2_callback"
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          oauth2_local: [
            strategy: Assent.Strategy.OAuth2,
            client_id: "trento-web",
            client_secret: "secret",
            auth_method: :client_secret_post,
            base_url: "https://provider.example.com",
            authorize_url: "/oauth/authorize",
            token_url: "/oauth/token",
            user_url: "/api/user",
            http_adapter: FakeIdentityProvider
          ]
        ]
      )

      stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_671_715_992 end)
      Application.put_env(:trento, :checks_service, base_url: "http://localhost:4001")
      stub(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      on_exit(fn ->
        Application.put_env(:trento, :oauth2, oauth2_config)
        Application.put_env(:trento, :pow_assent, pow_assent_config)
        Application.delete_env(:trento, :checks_service)
      end)
    end

    defp authorize(conn) do
      conn = get(conn, ~p"/auth/oauth2_local/authorize")

      %{"state" => state} =
        conn
        |> redirected_to(302)
        |> URI.parse()
        |> Map.fetch!(:query)
        |> URI.decode_query()

      {recycle(conn), state}
    end

    defp follow_authorize(conn, path) do
      conn = get(conn, path)

      %{"state" => state} =
        conn |> redirected_to(302) |> URI.parse() |> Map.fetch!(:query) |> URI.decode_query()

      {recycle(conn), state}
    end

    for {description, params} <- [
          {"without a state", %{"code" => "valid"}},
          {"with a null state", %{"code" => "valid", "state" => nil}},
          {"with a non-string state", %{"code" => "valid", "state" => 123}},
          {"carrying session params",
           %{"code" => "valid", "state" => "forged", "session_params" => %{"state" => "forged"}}}
        ] do
      @params params

      test "should reject a callback #{description}", %{conn: conn, api_spec: api_spec} do
        {conn, _state} = authorize(conn)

        conn
        |> post_callback(@params)
        |> json_response(422)
        |> assert_schema("UnprocessableEntityV1", api_spec)
      end
    end

    test "should not consume the stored state with a callback without a body",
         %{conn: conn, api_spec: api_spec} do
      {conn, state} = authorize(conn)

      conn = post(conn, ~p"/api/session/oauth2_local/callback")

      assert json_response(conn, 422)

      conn
      |> recycle()
      |> post_callback(%{"code" => "valid", "state" => state})
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
    end

    test "should not consume the stored state with an invalid callback",
         %{conn: conn, api_spec: api_spec} do
      {conn, state} = authorize(conn)

      conn = post_callback(conn, %{"code" => "valid", "state" => nil})

      assert json_response(conn, 422)

      conn
      |> recycle()
      |> post_callback(%{"code" => "valid", "state" => state})
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
    end

    test "should log in when the browser loads the callback page before posting the callback",
         %{conn: conn, api_spec: api_spec} do
      {conn, state} = authorize(conn)

      conn = get(conn, ~p"/auth/oauth2_callback?#{%{"code" => "valid", "state" => state}}")

      conn
      |> recycle()
      |> post_callback(%{"code" => "valid", "state" => state})
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
    end

    test "should log in when retrying from the login failed page after a failed callback",
         %{conn: conn, api_spec: api_spec} do
      {conn, state} = authorize(conn)

      conn = get(conn, ~p"/auth/oauth2_callback?#{%{"code" => "expired", "state" => state}}")
      [_, retry_url] = Regex.run(~r/ssoLoginUrl: '([^']*)'/, html_response(conn, 200))

      conn =
        conn
        |> recycle()
        |> post_callback(%{"code" => "expired", "state" => state})

      assert json_response(conn, 500)

      {conn, retry_state} = conn |> recycle() |> follow_authorize(retry_url)

      conn =
        get(conn, ~p"/auth/oauth2_callback?#{%{"code" => "valid", "state" => retry_state}}")

      conn
      |> recycle()
      |> post_callback(%{"code" => "valid", "state" => retry_state})
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
    end

    test "should log in when the returned state matches the one stored by the authorize request",
         %{conn: conn, api_spec: api_spec} do
      {conn, state} = authorize(conn)

      conn
      |> post_callback(%{"code" => "valid", "state" => state})
      |> json_response(200)
      |> assert_schema("CredentialsV1", api_spec)
    end

    test "should not log in when the returned state differs from the one stored by the authorize request",
         %{conn: conn} do
      {conn, _state} = authorize(conn)

      conn
      |> post_callback(%{"code" => "valid", "state" => "forged"})
      |> json_response(500)
    end

    test "should not log in when no authorize request was made", %{conn: conn} do
      conn
      |> post_callback(%{"code" => "valid", "state" => "forged"})
      |> json_response(500)
    end

    test "should not accept the stored state a second time", %{conn: conn} do
      {conn, state} = authorize(conn)

      conn =
        post_callback(conn, %{
          "code" => "valid",
          "state" => "forged"
        })

      conn
      |> recycle()
      |> post_callback(%{"code" => "valid", "state" => state})
      |> json_response(500)
    end
  end

  describe "saml_callback endpoint" do
    setup %{conn: conn} = context do
      Samly.State.init(Samly.State.ETS)

      Application.put_env(:trento, :saml,
        enabled: false,
        user_profile_attributes: %{
          username_field: "username",
          email_field: "email",
          first_name_field: "firstName",
          last_name_field: "lastName"
        }
      )

      conn =
        conn
        |> Plug.Conn.put_private(:plug_session, %{})
        |> Plug.Conn.put_private(:plug_session_fetch, :done)
        |> Pow.Plug.put_config(otp_app: :trento)

      Map.put(context, :conn, conn)
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
      |> assert_schema("CredentialsV1", api_spec)

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
      |> assert_schema("UnauthorizedV1", api_spec)
    end

    test "should return unauthorized in saml callback flow when user attributes are missing",
         %{conn: conn, api_spec: api_spec} do
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
      |> assert_schema("UnprocessableEntityV1", api_spec)
    end
  end

  describe "token introspection" do
    setup do
      stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_671_715_992 end)

      :ok
    end

    for type <- TokensCase.token_types() do
      @token_type type

      test "should introspect inactive token: #{type}", %{conn: conn, api_spec: api_spec} do
        token = TokensCase.token(@token_type)

        conn
        |> post("/api/session/token/introspect", %{
          "token" => token
        })
        |> json_response(200)
        |> assert_schema("IntrospectedTokenV1", api_spec)
        |> then(&assert %{active: false} == &1)
      end
    end

    test "should introspect active access token", %{conn: conn, api_spec: api_spec} do
      {valid_token, _} = TokensCase.valid_user_bound_access_token()

      conn
      |> post("/api/session/token/introspect", %{
        "token" => valid_token
      })
      |> json_response(200)
      |> assert_schema("IntrospectedTokenV1", api_spec)
      |> then(
        &assert %{
                  active: true,
                  sub: _,
                  jti: _,
                  exp: _,
                  aud: _,
                  iss: _,
                  iat: _,
                  nbf: _,
                  abilities: _
                } = &1
      )
    end

    test "should introspect active PAT", %{conn: conn, api_spec: api_spec} do
      {valid_token, _} = TokensCase.valid_pat()

      conn
      |> post("/api/session/token/introspect", %{
        "token" => valid_token
      })
      |> json_response(200)
      |> assert_schema("IntrospectedTokenV1", api_spec)
      |> then(
        &assert %{
                  active: true,
                  sub: _,
                  abilities: _
                } = &1
      )
    end
  end

  defp post_callback(conn, params, provider \\ "oauth2_local") do
    conn
    |> put_req_header("content-type", "application/json")
    |> post(~p"/api/session/#{provider}/callback", params)
  end
end
