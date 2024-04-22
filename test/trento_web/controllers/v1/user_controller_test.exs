defmodule TrentoWeb.V1.UserControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  @endpoint TrentoWeb.Endpoint

  setup %{conn: conn} do
    api_spec = ApiSpec.spec()

    {:ok, conn: put_req_header(conn, "accept", "application/json"), api_spec: api_spec}
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

      assert [%{id: ^user_one_id}, %{id: ^user_two_id}] = resp
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
      %{id: id, updated_at: updated_at} = insert(:user)

      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{current_user_id: id})
        |> subscribe_and_join(TrentoWeb.UserChannel, "users:#{id}")

      resp =
        conn
        |> put_req_header("content-type", "application/json")
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
      %{email: already_taken_email} = insert(:user)
      %{id: id} = insert(:user)

      valid_params = %{
        email: already_taken_email
      }

      conn
      |> put_req_header("content-type", "application/json")
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

    test "should update the user if parameters are valid", %{conn: conn, api_spec: api_spec} do
      %{id: id, email: email, fullname: fullname} = insert(:user)

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

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/users/#{id}", valid_params)
        |> json_response(:ok)
        |> assert_schema("UserItem", api_spec)

      refute resp.fullname == fullname
      refute resp.enabled == true
      refute resp.email == email

      assert_broadcast "user_locked", %{}, 1000
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
