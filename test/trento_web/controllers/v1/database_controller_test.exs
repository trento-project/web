defmodule TrentoWeb.V1.DatabaseControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import OpenApiSpex.TestAssertions

  import Mox

  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.Databases.Commands.DeregisterDatabaseInstance

  setup [:set_mox_from_context, :verify_on_exit!]

  setup :setup_api_spec_v1
  setup :setup_user

  describe "list" do
    test "should list all databases", %{conn: conn} do
      %{id: database_id} = insert(:database)

      insert_list(2, :database_instance, database_id: database_id)

      api_spec = ApiSpec.spec()

      conn = get(conn, "/api/v1/databases")

      conn
      |> json_response(200)
      |> assert_schema("DatabasesCollection", api_spec)
    end
  end

  describe "delete" do
    test "should send 204 response on successful database instance deletion", %{conn: conn} do
      %{id: database_id} = build(:database)

      %{host_id: host_id, instance_number: instance_number} =
        build(:database_instance, database_id: database_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterDatabaseInstance{
             database_id: ^database_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           } ->
          :ok
        end
      )

      conn
      |> delete("/api/v1/databases/#{database_id}/hosts/#{host_id}/instances/#{instance_number}")
      |> response(204)
    end

    test "should send 422 response if the database instance is still present", %{
      conn: conn
    } do
      %{id: database_id} = build(:database)

      %{host_id: host_id, instance_number: instance_number} =
        build(:database_instance, database_id: database_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterDatabaseInstance{
             database_id: ^database_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           } ->
          {:error, :instance_present}
        end
      )

      api_spec = ApiSpec.spec()

      conn
      |> delete("/api/v1/databases/#{database_id}/hosts/#{host_id}/instances/#{instance_number}")
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should send 404 response if the database instance is not found", %{
      conn: conn
    } do
      %{id: database_id} = build(:database)

      %{host_id: host_id, instance_number: instance_number} =
        build(:database_instance, database_id: database_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterDatabaseInstance{
             database_id: ^database_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           } ->
          {:error, :database_instance_not_registered}
        end
      )

      api_spec = ApiSpec.spec()

      conn
      |> delete("/api/v1/databases/#{database_id}/hosts/#{host_id}/instances/#{instance_number}")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end
  end

  describe "forbidden response" do
    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      %{id: database_id} = build(:database)

      %{host_id: host_id, instance_number: instance_number} =
        build(:database_instance, database_id: database_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      Enum.each(
        [
          delete(
            conn,
            "/api/v1/databases/#{database_id}/hosts/#{host_id}/instances/#{instance_number}"
          )
        ],
        fn conn ->
          conn
          |> json_response(:forbidden)
          |> assert_schema("Forbidden", api_spec)
        end
      )
    end
  end
end
