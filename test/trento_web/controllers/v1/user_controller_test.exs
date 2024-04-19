defmodule TrentoWeb.UserControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias Trento.Users

  alias TrentoWeb.OpenApi.V1.ApiSpec

  setup %{conn: conn} do
    api_spec = ApiSpec.spec()

    {:ok, conn: put_req_header(conn, "accept", "application/json"), api_spec: api_spec}
  end

  describe "index" do
    test "lists all users", %{conn: conn, api_spec: api_spec} do
      %{id: user_one_id} = create_user()
      %{id: user_two_id} = create_user()

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
      %{email: already_taken_email} = create_user()

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
      %{id: id, updated_at: updated_at} = create_user()

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> patch("/api/v1/users/#{id}", %{})
        |> json_response(:ok)
        |> assert_schema("UserItem", api_spec)

      assert resp.updated_at == updated_at
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
      %{email: already_taken_email} = create_user()
      %{id: id} = create_user()

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
      %{id: id} = create_user()

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
      %{id: id, email: email, fullname: fullname} = create_user()

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
      %{id: id} = create_user()

      conn
      |> put_req_header("content-type", "application/json")
      |> delete("/api/v1/users/#{id}")
      |> response(:no_content)
    end
  end

  # describe "create user" do
  #   test "renders user when data is valid", %{conn: conn} do
  #     conn = post(conn, Routes.user_path(conn, :create), user: @create_attrs)
  #     assert %{"id" => id} = json_response(conn, 201)["data"]

  #     conn = get(conn, Routes.user_path(conn, :show, id))

  #     assert %{
  #              "id" => ^id,
  #              "fullname" => "some fullname",
  #              "name" => "some name",
  #              "password" => "some password"
  #            } = json_response(conn, 200)["data"]
  #   end

  #   test "renders errors when data is invalid", %{conn: conn} do
  #     conn = post(conn, Routes.user_path(conn, :create), user: @invalid_attrs)
  #     assert json_response(conn, 422)["errors"] != %{}
  #   end
  # end

  # describe "update user" do
  #   setup [:create_user]

  #   test "renders user when data is valid", %{conn: conn, user: %User{id: id} = user} do
  #     conn = put(conn, Routes.user_path(conn, :update, user), user: @update_attrs)
  #     assert %{"id" => ^id} = json_response(conn, 200)["data"]

  #     conn = get(conn, Routes.user_path(conn, :show, id))

  #     assert %{
  #              "id" => ^id,
  #              "fullname" => "some updated fullname",
  #              "name" => "some updated name",
  #              "password" => "some updated password"
  #            } = json_response(conn, 200)["data"]
  #   end

  #   test "renders errors when data is invalid", %{conn: conn, user: user} do
  #     conn = put(conn, Routes.user_path(conn, :update, user), user: @invalid_attrs)
  #     assert json_response(conn, 422)["errors"] != %{}
  #   end
  # end

  # describe "delete user" do
  #   setup [:create_user]

  #   test "deletes chosen user", %{conn: conn, user: user} do
  #     conn = delete(conn, Routes.user_path(conn, :delete, user))
  #     assert response(conn, 204)

  #     assert_error_sent 404, fn ->
  #       get(conn, Routes.user_path(conn, :show, user))
  #     end
  #   end

  defp create_user do
    password = "themightypassword8897"

    {:ok, user} =
      Users.create_user(%{
        email: Faker.Internet.email(),
        fullname: Faker.Pokemon.name(),
        password: password,
        password_confirmation: password,
        username: Faker.Pokemon.name()
      })

    user
  end
end
