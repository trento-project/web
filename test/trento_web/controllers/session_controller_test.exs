defmodule TrentoWeb.SessionControllerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false

  import Mox
  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    user =
      %Trento.User{}
      |> Trento.User.changeset(%{
        username: "admin",
        password: "testpassword",
        confirm_password: "testpassword"
      })
      |> Trento.Repo.insert!()

    api_spec = ApiSpec.spec()

    {:ok, user: user, api_spec: api_spec}
  end

  describe "refresh endpoint" do
    test "should return refreshed credentials for the user when the refresh token is valid", %{
      conn: conn,
      api_spec: api_spec
    } do
      refresh_token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY2MzQxNCwiaWF0IjoxNjcxNjQxODE0LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwaTNzMGZzNmZqcHE5dnVrMDAwNWUxIiwibmJmIjoxNjcxNjQxODE0LCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ.FdPblWJ23PDBv5V2EhVNsaW4_-gZP0M9wnwYAlGOa1E"

      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        5,
        fn ->
          1_671_641_814
        end
      )

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
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cmVudG8tcHJvamVjdCIsImV4cCI6MTY3MTY2MzQxNCwiaWF0IjoxNjcxNjQxODE0LCJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vdHJlbnRvLXByb2plY3Qvd2ViIiwianRpIjoiMnNwaTNzMGZzNmZqcHE5dnVrMDAwNWUxIiwibmJmIjoxNjcxNjQxODE0LCJzdWIiOjEsInR5cCI6IlJlZnJlc2gifQ.FdPblWJ23PDBv5V2EhVNsaW4_-gZP0M9wnwYAlGOa1E"

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

      assert %{username: "admin"} = resp
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
          "username" => "admin",
          "password" => "testpassword"
        })

      conn
      |> json_response(200)
      |> assert_schema("Credentials", api_spec)
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
          "username" => "admin",
          "password" => "testpassword2"
        })

      resp = json_response(conn, 401)

      assert %{"errors" => [%{"detail" => "Invalid credentials.", "title" => "Unauthorized"}]} =
               resp
    end
  end
end
