defmodule TrentoWeb.V1.UsersControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  @endpoint TrentoWeb.Endpoint

  setup :setup_api_spec_v1
  setup :setup_user

  describe "forbidden response" do
    test "should return not implemented on create endpoint when external idp integration is enabled",
         %{conn: conn} do
      Application.put_env(:trento, :oidc, enabled: true)

      res = post(conn, "/api/v1/users", %{})

      json_response(res, 501)
    end

    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      Enum.each(
        [
          get(conn, "/api/v1/users"),
          post(conn, "/api/v1/users", %{}),
          patch(conn, "/api/v1/users/1", %{}),
          get(conn, "/api/v1/users/1"),
          delete(conn, "/api/v1/users/1")
        ],
        fn conn ->
          conn
          |> json_response(:forbidden)
          |> assert_schema("Forbidden", api_spec)
        end
      )
    end
  end

  describe "index" do
    test "lists all users", %{conn: conn, api_spec: api_spec} do
      %{id: user_one_id} = insert(:user)
      %{id: user_two_id} = insert(:user)

      conn = get(conn, "/api/v1/users")

      resp =
        conn
        |> json_response(200)
        |> assert_schema("UserCollection", api_spec)

      assert [_, %{id: ^user_one_id}, %{id: ^user_two_id}] = resp
    end
  end

  describe "show user" do
    test "should show the user when user exists", %{conn: conn, api_spec: api_spec} do
      %{id: id, lock_version: lock_version} = insert(:user)

      conn = get(conn, "/api/v1/users/#{id}")

      resp =
        conn
        |> json_response(200)
        |> assert_schema("UserItem", api_spec)

      [etag] = get_resp_header(conn, "etag")
      assert etag == Integer.to_string(lock_version)
      assert %{id: ^id} = resp
    end

    test "should not show the user when does not exists", %{conn: conn, api_spec: api_spec} do
      get(conn, "/api/v1/users/98908098")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end
  end

  describe "create user" do
    test "should create the user when parameters are valid", %{conn: conn, api_spec: api_spec} do
      valid_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        username: Faker.Pokemon.name(),
        enabled: true,
        password: "testpassword89",
        password_confirmation: "testpassword89"
      }

      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/users", valid_params)

      conn
      |> json_response(:created)
      |> assert_schema("UserItem", api_spec)

      [etag] = get_resp_header(conn, "etag")
      assert etag == "1"
    end

    test "should create the user with abilities", %{conn: conn, api_spec: api_spec} do
      %{id: id, name: name, resource: resource, label: label} = insert(:ability)

      valid_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        username: Faker.Pokemon.name(),
        enabled: true,
        password: "testpassword89",
        password_confirmation: "testpassword89",
        abilities: [%{id: id, name: name, resource: resource, label: label}]
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/users", valid_params)
      |> json_response(:created)
      |> assert_schema("UserItem", api_spec)
    end

    test "should not create the user when request parameters are not valid", %{
      conn: conn,
      api_spec: api_spec
    } do
      invalid_request_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        username: Faker.Pokemon.name(),
        password: "testpassword89",
        password_confirmation: "testpassword89"
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/users", invalid_request_params)
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should not create the user when request parameters are valid but error are returned during creation",
         %{conn: conn, api_spec: api_spec} do
      %{email: already_taken_email} = insert(:user)

      valid_params = %{
        fullname: Faker.Person.name(),
        email: already_taken_email,
        username: Faker.Pokemon.name(),
        enabled: true,
        password: "testpassword89",
        password_confirmation: "notequal"
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/users", valid_params)
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end
  end

  describe "update user" do
    test "should not update an existing user if the body is empty in a patch operation", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: id, updated_at: updated_at, lock_version: lock_version} = insert(:user)

      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{current_user_id: id})
        |> subscribe_and_join(TrentoWeb.UserChannel, "users:#{id}")

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> put_req_header("if-match", "#{lock_version}")
        |> patch("/api/v1/users/#{id}", %{})
        |> json_response(:ok)
        |> assert_schema("UserItem", api_spec)

      assert resp.updated_at == updated_at

      assert_broadcast "user_updated", %{}, 1000
    end

    test "should return 404 if the user does not exists", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/users/8789578945574", %{})
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end

    test "should not update the user if parameters are valid but an error is returned from update operation",
         %{conn: conn, api_spec: api_spec} do
      %{email: already_taken_email, lock_version: lock_version} = insert(:user)
      %{id: id} = insert(:user)

      valid_params = %{
        email: already_taken_email
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> put_req_header("if-match", "#{lock_version}")
      |> patch("/api/v1/users/#{id}", valid_params)
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should not update the user if parameters are not valid", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: id} = insert(:user)

      invalid_params = %{
        enabled: "invalid"
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/users/#{id}", invalid_params)
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should not update the user when the request conditional prerequisite is missing", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: id} = insert(:user)

      conn
      |> put_req_header("content-type", "application/json")
      |> patch("/api/v1/users/#{id}", %{})
      |> json_response(:precondition_required)
      |> assert_schema("PreconditionRequired", api_spec)
    end

    test "should not update the user when the request conditional prerequisite is failing due to mid-air collision",
         %{conn: conn, api_spec: api_spec} do
      %{id: id} = insert(:user)

      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{current_user_id: id})
        |> subscribe_and_join(TrentoWeb.UserChannel, "users:#{id}")

      valid_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        enabled: false,
        password: "testpassword89",
        password_confirmation: "testpassword89"
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> put_req_header("if-match", "222")
      |> patch("/api/v1/users/#{id}", valid_params)
      |> json_response(:precondition_failed)
      |> assert_schema("PreconditionFailed", api_spec)
    end

    test "should update the user if parameters are valid", %{conn: conn, api_spec: api_spec} do
      %{id: id, email: email, fullname: fullname, lock_version: lock_version} = insert(:user)

      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{current_user_id: id})
        |> subscribe_and_join(TrentoWeb.UserChannel, "users:#{id}")

      valid_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        enabled: false,
        password: "testpassword89",
        password_confirmation: "testpassword89"
      }

      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> put_req_header("if-match", "#{lock_version}")
        |> patch("/api/v1/users/#{id}", valid_params)

      resp =
        conn
        |> json_response(:ok)
        |> assert_schema("UserItem", api_spec)

      refute resp.fullname == fullname
      refute resp.enabled == true
      refute resp.email == email

      assert_broadcast "user_locked", %{}, 1000

      [etag] = get_resp_header(conn, "etag")
      assert etag == "#{lock_version + 1}"
    end

    test "should update the user with abilities", %{conn: conn, api_spec: api_spec} do
      %{id: id, name: name, resource: resource, label: label} = insert(:ability)
      %{id: user_id, lock_version: lock_version} = insert(:user)

      valid_params = %{
        fullname: Faker.Person.name(),
        email: Faker.Internet.email(),
        enabled: false,
        password: "testpassword89",
        password_confirmation: "testpassword89",
        abilities: [%{id: id, name: name, resource: resource, label: label}]
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> put_req_header("if-match", "#{lock_version}")
      |> patch("/api/v1/users/#{user_id}", valid_params)
      |> json_response(:ok)
      |> assert_schema("UserItem", api_spec)
    end

    test "should disable the TOTP feature for a user", %{conn: conn, api_spec: api_spec} do
      %{id: user_id, lock_version: lock_version} =
        insert(:user, totp_enabled_at: DateTime.utc_now())

      valid_params = %{
        totp_disabled: true
      }

      conn
      |> put_req_header("content-type", "application/json")
      |> put_req_header("if-match", "#{lock_version}")
      |> patch("/api/v1/users/#{user_id}", valid_params)
      |> json_response(:ok)
      |> assert_schema("UserItem", api_spec)
    end
  end

  describe "delete user" do
    test "should not delete a user when the user is not found", %{conn: conn, api_spec: api_spec} do
      conn
      |> put_req_header("content-type", "application/json")
      |> delete("/api/v1/users/8908409480")
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end

    test "should delete a user when the user is found", %{conn: conn} do
      %{id: id} = insert(:user)

      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{current_user_id: id})
        |> subscribe_and_join(TrentoWeb.UserChannel, "users:#{id}")

      conn
      |> put_req_header("content-type", "application/json")
      |> delete("/api/v1/users/#{id}")
      |> response(:no_content)

      assert_broadcast "user_deleted", %{}, 1000
    end
  end
end
