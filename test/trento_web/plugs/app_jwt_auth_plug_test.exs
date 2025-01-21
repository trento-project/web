defmodule TrentoWeb.Plugs.AppJWTAuthPlugTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Auth.{
    AccessToken,
    RefreshToken
  }

  alias Trento.Users
  alias Trento.Users.User
  alias TrentoWeb.Plugs.AppJWTAuthPlug

  import Mox
  import Trento.Factory

  @pow_config [otp_app: :trento]

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    stub(
      Joken.CurrentTime.Mock,
      :current_time,
      fn ->
        1_671_715_992
      end
    )

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
      %{id: user_id, abilities: [%{name: name, resource: resource} | _]} =
        user = insert(:user_with_abilities)

      assert {res_conn, %{id: ^user_id}} = AppJWTAuthPlug.create(conn, user, @pow_config)

      assert %{
               private: %{
                 api_access_token: jwt,
                 access_token_expiration: 180,
                 api_refresh_token: _refresh
               }
             } = res_conn

      assert {:ok,
              %{
                "sub" => ^user_id,
                "abilities" => [%{"name" => ^name, "resource" => ^resource}]
              }} = AccessToken.verify_and_validate(jwt)
    end
  end

  describe "fetch/2" do
    test "should fetch a user when the jwt is valid", %{conn: conn} do
      jwt =
        AccessToken.generate_access_token!(%{
          "sub" => 1,
          "abilities" => [%{name: "foo", resource: "bar"}]
        })

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> jwt)

      assert {res_conn,
              %{
                "access_token" => ^jwt,
                "user_id" => 1,
                "abilities" => [%{"name" => "foo", "resource" => "bar"}]
              }} = AppJWTAuthPlug.fetch(conn, @pow_config)

      assert %{
               private: %{
                 api_access_token: ^jwt,
                 user_id: 1
               }
             } = res_conn
    end

    test "should not fetch a user when the jwt signature is invalid", %{conn: conn} do
      bad_jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJzdWIiOjF9.PRqQgJkfxrusFtvkwk-2utMNde0TZN9zcx7ncmVxvk8"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> bad_jwt)

      assert {_res_conn, nil} = AppJWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch user when the header is missing", %{conn: conn} do
      assert {_res_conn, nil} = AppJWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch user when the jwt is malformed", %{conn: conn} do
      bad_jwt = "do you know jwt?"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> bad_jwt)

      assert {_res_conn, nil} = AppJWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch user when the jwt signature is valid but it's expired", %{conn: conn} do
      expired_jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY0MjQxNCwiaWF0IjoxNjcxNjQxODE0LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwaTFvbmxxbml1ZnE5dnVrMDAwMG9hIiwibmJmIjoxNjcxNjQxODE0LCJzdWIiOjEsInR5cCI6IkJlYXJlciJ9.oub6_NsHcVIyd0de14Lzk3SuCMMgr8O-sSWLr7Gxcp8"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> expired_jwt)

      assert {_res_conn, nil} = AppJWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch the user when the jwt signature is valid but the audience is not valid",
         %{conn: conn} do
      bad_aud_jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG9fYXBwbmV3IiwiZXhwIjoxNzA4OTY1MzM0LCJpYXQiOjE3MDg5NjQ3MzQsImlzcyI6Imh0dHBzOi8vZ2l0aHViLmNvbS90cmVudG8tcHJvamVjdC93ZWIiLCJqdGkiOiIydXJuY25vMmpvNTNtNG1yYmcwMDIxNTIiLCJuYmYiOjE3MDg5NjQ3MzQsInN1YiI6MSwidHlwIjoiQmVhcmVyIn0.nRoRuP4DqijsTn0KmxWgfhX9KAjsPubXuzTmEYnSpao"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> bad_aud_jwt)

      assert {_res_conn, nil} = AppJWTAuthPlug.fetch(conn, @pow_config)
    end
  end
end
