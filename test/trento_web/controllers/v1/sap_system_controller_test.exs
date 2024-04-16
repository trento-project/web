defmodule TrentoWeb.V1.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import OpenApiSpex.TestAssertions

  import Mox

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "list" do
    test "should list all sap_systems", %{conn: conn} do
      %{id: database_id} = insert(:database)
      %{id: sap_system_id} = insert(:sap_system, database_id: database_id)

      insert_list(2, :database_instance, database_id: database_id)
      insert_list(2, :application_instance, sap_system_id: sap_system_id)

      api_spec = ApiSpec.spec()

      conn = get(conn, "/api/v1/sap_systems")

      conn
      |> json_response(200)
      |> assert_schema("SAPSystemsCollection", api_spec)
    end
  end

  describe "delete" do
    test "should send 204 response on successful application instance deletion", %{conn: conn} do
      %{id: sap_system_id} = build(:sap_system)

      %{host_id: host_id, instance_number: instance_number} =
        build(:application_instance, sap_system_id: sap_system_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterApplicationInstance{
             sap_system_id: ^sap_system_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           } ->
          :ok
        end
      )

      conn
      |> delete(
        "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{instance_number}"
      )
      |> response(204)
    end

    test "should send 422 response if the application instance is still present", %{
      conn: conn
    } do
      %{id: sap_system_id} = build(:sap_system)

      %{host_id: host_id, instance_number: instance_number} =
        build(:application_instance, sap_system_id: sap_system_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterApplicationInstance{
             sap_system_id: ^sap_system_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           } ->
          {:error, :instance_present}
        end
      )

      api_spec = ApiSpec.spec()

      conn
      |> delete(
        "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{instance_number}"
      )
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should send 404 response if the application instance is not found", %{
      conn: conn
    } do
      %{id: sap_system_id} = build(:sap_system)

      %{host_id: host_id, instance_number: instance_number} =
        build(:application_instance, sap_system_id: sap_system_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterApplicationInstance{
             sap_system_id: ^sap_system_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           } ->
          {:error, :application_instance_not_registered}
        end
      )

      api_spec = ApiSpec.spec()

      conn
      |> delete(
        "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{instance_number}"
      )
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end
  end
end
