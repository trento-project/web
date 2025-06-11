defmodule TrentoWeb.V1.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import OpenApiSpex.TestAssertions

  import Mox

  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

  alias Trento.Infrastructure.Operations.AMQP.Publisher, as: OperationsPublisher

  setup [:set_mox_from_context, :verify_on_exit!]

  setup :setup_api_spec_v1
  setup :setup_user

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

    test "should allow the request when the user has cleanup:application_instance ability", %{
      conn: conn
    } do
      %{id: sap_system_id} = build(:sap_system)

      %{host_id: host_id, instance_number: instance_number} =
        build(:application_instance, sap_system_id: sap_system_id)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "cleanup", resource: "application_instance")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

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
  end

  describe "request_instance_operation" do
    test "should fallback to operation not found if the operation is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: host_id} = insert(:host)

      %{sap_system_id: sap_system_id, instance_number: inst_number} =
        insert(:application_instance, host_id: host_id)

      conn
      |> put_req_header("content-type", "application/json")
      |> post(
        "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{inst_number}/operations/unknown",
        %{}
      )
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end

    for operation <- [:sap_instance_start, :sap_instance_stop] do
      @operation operation

      test "should fallback to not found on operation #{operation} if the sap system is not found",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/sap_systems/#{UUID.uuid4()}/hosts/#{UUID.uuid4()}/instances/00/operations/#{@operation}",
          %{}
        )
        |> json_response(:not_found)
        |> assert_schema("NotFound", api_spec)
      end

      test "should fallback to not found on operation #{operation} if the host is not found",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{sap_system_id: sap_system_id} = insert(:application_instance)

        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/sap_systems/#{sap_system_id}/hosts/#{UUID.uuid4()}/instances/00/operations/#{@operation}",
          %{}
        )
        |> json_response(:not_found)
        |> assert_schema("NotFound", api_spec)
      end

      test "should fallback to not found on operation #{operation} if the sap instance is not found",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{id: host_id} = insert(:host)
        %{sap_system_id: sap_system_id} = insert(:application_instance, host_id: host_id)

        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/01/operations/#{@operation}",
          %{}
        )
        |> json_response(:not_found)
        |> assert_schema("NotFound", api_spec)
      end

      test "should respond with 500 for operation #{operation} on messaging error", %{conn: conn} do
        %{id: host_id} = insert(:host)

        %{sap_system_id: sap_system_id, instance_number: inst_number} =
          insert(:application_instance, features: "MESSAGESERVER|ENQUE", host_id: host_id)

        %{id: database_id} = insert(:database, health: :passing)
        insert(:sap_system, id: sap_system_id, database_id: database_id)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher, _, _ ->
            {:error, :amqp_error}
          end
        )

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> post(
            "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{inst_number}/operations/#{@operation}",
            %{}
          )
          |> json_response(:internal_server_error)

        assert %{
                 "errors" => [
                   %{
                     "detail" => "Something went wrong.",
                     "title" => "Internal Server Error"
                   }
                 ]
               } = resp
      end

      test "should perform operation #{operation} properly",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{id: cluster_id} =
          insert(:cluster,
            details:
              build(:ascs_ers_cluster_details,
                maintenance_mode: true,
                sap_systems: []
              )
          )

        %{id: host_id} = insert(:host, cluster_id: cluster_id)

        %{sap_system_id: sap_system_id, instance_number: inst_number} =
          insert(:application_instance, features: "MESSAGESERVER|ENQUE", host_id: host_id)

        %{id: database_id} = insert(:database, health: :passing)
        insert(:sap_system, id: sap_system_id, database_id: database_id)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher, _, _ ->
            :ok
          end
        )

        posted_conn =
          conn
          |> put_req_header("content-type", "application/json")
          |> post(
            "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{inst_number}/operations/#{@operation}",
            %{}
          )

        posted_conn
        |> json_response(:accepted)
        |> assert_schema("OperationAccepted", api_spec)

        assert %{
                 assigns: %{
                   instance: %{
                     sap_system_id: ^sap_system_id,
                     host: %{id: ^host_id, cluster: %{id: ^cluster_id}}
                   }
                 }
               } = posted_conn
      end
    end
  end

  describe "forbidden response" do
    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      %{id: sap_system_id} = build(:sap_system)

      %{host_id: host_id, instance_number: instance_number} =
        build(:application_instance, sap_system_id: sap_system_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      Enum.each(
        [
          delete(
            conn,
            "/api/v1/sap_systems/#{sap_system_id}/hosts/#{host_id}/instances/#{instance_number}"
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
