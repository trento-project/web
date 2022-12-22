defmodule TrentoWeb.JWTAuthPlugTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Auth.{
    AccessToken,
    JWTAuthPlug
    RefreshToken,
  }

  import Mox

  @pow_config [otp_app: :trento]

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "delete/2" do
    test "should no-op and return the passed conn", %{conn: conn} do
      res_conn = JWTAuthPlug.delete(conn, @pow_config)

      assert conn == res_conn
    end
  end

  describe "renew/2" do
    test "should put in conn private a renewd access token if the refresh token is valid", %{
      conn: conn
    } do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        8,
        fn ->
          1_671_715_992
        end
      )

      valid_refresh = RefreshToken.generate_refresh_token!(%{"sub" => 1})

      {:ok, res_conn} = JWTAuthPlug.renew(conn, valid_refresh)

      assert %{
               private: %{
                 api_access_token: new_access_token,
                 access_token_expiration: 600
               }
             } = res_conn

      assert {:ok, %{"typ" => "Bearer"}} = Joken.peek_claims(new_access_token)
    end

    test "should return an error if the refresh token is malformed", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      {:error, _reason} = JWTAuthPlug.renew(conn, "invalid")
    end

    test "should return an error if the refresh token signature is invalid", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_715_992
        end
      )

      bad_refresh =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ.Ctg1bAbWgk2Fr69v7bwT7oxR9XUa1-iNtoZTYbzHOIk"

      {:error, :signature_error} = JWTAuthPlug.renew(conn, bad_refresh)
    end

    test "should return an error is the refresh token signature is valid but it's expired", %{
      conn: conn
    } do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        1,
        fn ->
          1_671_715_992
        end
      )

      expired_refresh =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY2MzQxNCwiaWF0IjoxNjcxNjQxODE0LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwaTNzMGZzNmZqcHE5dnVrMDAwNWUxIiwibmJmIjoxNjcxNjQxODE0LCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ.FdPblWJ23PDBv5V2EhVNsaW4_-gZP0M9wnwYAlGOa1E"

      {:error, [message: "Invalid token", claim: "exp", claim_val: 1_671_663_414]} =
        JWTAuthPlug.renew(conn, expired_refresh)
    end
  end

  describe "create/3" do
    test "should add to the conn the access/refresh token pair and the expiration", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        6,
        fn ->
          1_671_715_992
        end
      )

      user = %{id: 1}

      assert {res_conn, ^user} = JWTAuthPlug.create(conn, user, @pow_config)

      assert %{
               private: %{
                 api_access_token: _jwt,
                 access_token_expiration: 600,
                 api_refresh_token: _refresh
               }
             } = res_conn
    end
  end

  describe "fetch/2" do
    test "should fetch a user when the jwt is valid", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        5,
        fn ->
          1_671_715_992
        end
      )

      jwt = AccessToken.generate_access_token!(%{"sub" => 1})

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> jwt)

      assert {res_conn,
              %{
                "access_token" => ^jwt,
                "user_id" => 1
              }} = JWTAuthPlug.fetch(conn, @pow_config)

      assert %{private: %{api_access_token: ^jwt, user_id: 1}} = res_conn
    end

    test "should not fetch a user when the jwt signature is invalid", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_641_814
        end
      )

      bad_jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTU1NjY5MiwiaWF0IjoxNjcxNTQ5NDkyLCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwOGlxMmkxNnRlbHNycWE4MDAwMWM4IiwibmJmIjoxNjcxNTQ5NDkyLCJzdWIiOjF9.PRqQgJkfxrusFtvkwk-2utMNde0TZN9zcx7ncmVxvk8"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> bad_jwt)

      assert {_res_conn, nil} = JWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch user when the header is missing", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_641_814
        end
      )

      assert {_res_conn, nil} = JWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch user when the jwt is malformed", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        0,
        fn ->
          1_671_641_814
        end
      )

      bad_jwt = "do you know jwt?"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> bad_jwt)

      assert {_res_conn, nil} = JWTAuthPlug.fetch(conn, @pow_config)
    end

    test "should not fetch user when the jwt signature is valid but it's expired", %{conn: conn} do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        1,
        fn ->
          1_671_715_992
        end
      )

      expired_jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY0MjQxNCwiaWF0IjoxNjcxNjQxODE0LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwaTFvbmxxbml1ZnE5dnVrMDAwMG9hIiwibmJmIjoxNjcxNjQxODE0LCJzdWIiOjEsInR5cCI6IkJlYXJlciJ9.oub6_NsHcVIyd0de14Lzk3SuCMMgr8O-sSWLr7Gxcp8"

      conn = Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> expired_jwt)

      assert {_res_conn, nil} = JWTAuthPlug.fetch(conn, @pow_config)
    end
  end
end
