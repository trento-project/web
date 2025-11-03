defmodule TrentoWeb.Plugs.AppJWTAuthPlugTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true
  use TrentoWeb.TokensCase

  alias TrentoWeb.Auth.RefreshToken

  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.Plugs.AppJWTAuthPlug

  import Mox

  @pow_config [otp_app: :trento]

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_timestamp 1_671_715_992

  setup do
    stub(Joken.CurrentTime.Mock, :current_time, fn -> @test_timestamp end)

    :ok
  end

  describe "delete/2" do
    test "should no-op and return the passed conn", %{conn: conn} do
      res_conn = AppJWTAuthPlug.delete(conn, @pow_config)

      assert conn == res_conn
    end
  end

  describe "renew/2" do
    setup do
      password = "themightypassword8897"

      {:ok, user} =
        Users.create_user(%{
          email: Faker.Internet.email(),
          fullname: Faker.Pokemon.name(),
          password: password,
          password_confirmation: password,
          username: Faker.Pokemon.name()
        })

      %{user: user}
    end

    test "should renew a token and put it in the conn private if the refresh token is valid", %{
      conn: conn,
      user: user
    } do
      valid_refresh = RefreshToken.generate_refresh_token!(%{"sub" => user.id})

      {:ok, res_conn} = AppJWTAuthPlug.renew(conn, valid_refresh)

      assert %{
               private: %{
                 api_access_token: new_access_token,
                 access_token_expiration: 180
               }
             } = res_conn

      assert {:ok, %{"typ" => "Bearer"}} = Joken.peek_claims(new_access_token)
    end

    test "should not renew a token if the token is valid but the associated user is not found", %{
      conn: conn
    } do
      valid_refresh = RefreshToken.generate_refresh_token!(%{"sub" => Faker.Address.zip_code()})

      {:error, :not_found} = AppJWTAuthPlug.renew(conn, valid_refresh)
    end

    test "should not renew a token if the token is valid but the associated user is deleted", %{
      conn: conn,
      user: user
    } do
      {:ok, %User{} = user} = Trento.Users.delete_user(user)
      valid_refresh = RefreshToken.generate_refresh_token!(%{"sub" => user.id})
      {:error, :not_found} = AppJWTAuthPlug.renew(conn, valid_refresh)
    end

    test "should not renew a token if the token is valid but the associated user is locked", %{
      conn: conn,
      user: user
    } do
      {:ok, %User{} = user} = Trento.Users.update_user(user, %{enabled: false})
      valid_refresh = RefreshToken.generate_refresh_token!(%{"sub" => user.id})
      {:error, :user_not_allowed_to_renew} = AppJWTAuthPlug.renew(conn, valid_refresh)
    end

    test "should return an error if the refresh token is malformed", %{conn: conn} do
      {:error, _reason} = AppJWTAuthPlug.renew(conn, "invalid")
    end

    test "should return an error if the refresh token signature is invalid", %{conn: conn} do
      bad_refresh =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ.Ctg1bAbWgk2Fr69v7bwT7oxR9XUa1-iNtoZTYbzHOIk"

      {:error, :signature_error} = AppJWTAuthPlug.renew(conn, bad_refresh)
    end

    test "should return an error is the refresh token signature is valid but it's expired", %{
      conn: conn
    } do
      expired_refresh =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBwIiwiZXhwIjoxNjcxNjYzNDE0LCJpYXQiOjE2NzE2NDE4MTQsImlzcyI6Imh0dHBzOi8vZ2l0aHViLmNvbS90cmVudG8tcHJvamVjdC93ZWIiLCJqdGkiOiIyc3BpM3MwZnM2ZmpwcTl2dWswMDA1ZTEiLCJuYmYiOjE2NzE2NDE4MTQsInN1YiI6MSwidHlwIjoiUmVmcmVzaCJ9.73ajWvgUml4F4Ml5rACyUeAlipknOUdQFy6t8tYZf5Y"

      {:error, [message: "Invalid token", claim: "exp", claim_val: 1_671_663_414]} =
        AppJWTAuthPlug.renew(conn, expired_refresh)
    end

    test "should return an error if the refresh token is signed but the audience is different then trento_app",
         %{conn: conn} do
      refresh_different_aud =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXVkbmV3IiwiZXhwIjoxNjcxNjYzNDE0LCJpYXQiOjE2NzE2NDE4MTQsImlzcyI6Imh0dHBzOi8vZ2l0aHViLmNvbS90cmVudG8tcHJvamVjdC93ZWIiLCJqdGkiOiIyc3BpM3MwZnM2ZmpwcTl2dWswMDA1ZTEiLCJuYmYiOjE2NzE2NDE4MTQsInN1YiI6MSwidHlwIjoiUmVmcmVzaCJ9.V65Ip_Rs3gpIk6AV33Tib38EyaTPq6IH9vkldk9Mcz8"

      {:error, [message: "Invalid token", claim: "aud", claim_val: "trento_audnew"]} =
        AppJWTAuthPlug.renew(conn, refresh_different_aud)
    end
  end

  describe "create/3" do
    test "should add to the conn the access/refresh token pair and the expiration", %{conn: conn} do
      user = %{id: 1}

      assert {res_conn, ^user} = AppJWTAuthPlug.create(conn, user, @pow_config)

      assert %{
               private: %{
                 api_access_token: _jwt,
                 access_token_expiration: 180,
                 api_refresh_token: _refresh
               }
             } = res_conn
    end
  end

  describe "fetch/2" do
    test "should not fetch user when the header is missing", %{conn: conn} do
      assert {_res_conn, nil} = AppJWTAuthPlug.fetch(conn, @pow_config)
    end

    for type <- TokensCase.token_types() do
      @token_type type

      test "should not fetch a user on invalid jwt: #{type}", %{conn: conn} do
        assert {_res_conn, nil} =
                 conn
                 |> Plug.Conn.put_req_header(
                   "authorization",
                   "Bearer " <> TokensCase.token(@token_type)
                 )
                 |> AppJWTAuthPlug.fetch(@pow_config)
      end
    end

    test "should fetch a user when the access token is valid", %{conn: conn} do
      {jwt, %{"sub" => user_id}} = TokensCase.valid_access_token()

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> jwt)

      assert {res_conn,
              %{
                "access_token" => ^jwt,
                "user_id" => ^user_id
              }} = AppJWTAuthPlug.fetch(conn, @pow_config)

      assert %{
               private: %{
                 api_access_token: ^jwt,
                 user_id: ^user_id
               }
             } = res_conn
    end

    test "should fetch a user when the PAT is valid", %{conn: conn} do
      {valid_pat, %{"sub" => user_id}} = TokensCase.valid_pat()

      assert {res_conn,
              %{
                "access_token" => ^valid_pat,
                "user_id" => ^user_id
              }} =
               conn
               |> Plug.Conn.put_req_header("authorization", "Bearer " <> valid_pat)
               |> AppJWTAuthPlug.fetch(@pow_config)

      assert %{
               private: %{
                 api_access_token: ^valid_pat
               }
             } = res_conn
    end
  end
end
