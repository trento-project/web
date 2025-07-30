defmodule TrentoWeb.V1.DatabaseControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  import OpenApiSpex.TestAssertions

  import Mox

  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.Databases.Commands.DeregisterDatabaseInstance

  alias Trento.Infrastructure.Operations.AMQP.Publisher, as: OperationsPublisher

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
           },
           _ ->
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
           },
           _ ->
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
           },
           _ ->
          {:error, :database_instance_not_registered}
        end
      )

      api_spec = ApiSpec.spec()

      conn
      |> delete("/api/v1/databases/#{database_id}/hosts/#{host_id}/instances/#{instance_number}")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end

    test "should allow the request when the user has cleanup:database_instance ability", %{
      conn: conn
    } do
      %{id: database_id} = build(:database)

      %{host_id: host_id, instance_number: instance_number} =
        build(:database_instance, database_id: database_id)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "cleanup", resource: "database_instance")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %DeregisterDatabaseInstance{
             database_id: ^database_id,
             host_id: ^host_id,
             instance_number: ^instance_number
           },
           _ ->
          :ok
        end
      )

      conn
      |> delete("/api/v1/databases/#{database_id}/hosts/#{host_id}/instances/#{instance_number}")
      |> response(204)
    end
  end

  describe "request_operation" do
    test "should fallback to operation not found if the operation is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: database_id} = insert(:database)

      conn
      |> put_req_header("content-type", "application/json")
      |> post(
        "/api/v1/databases/#{database_id}/operations/unknown",
        %{}
      )
      |> json_response(:not_found)
      |> assert_schema("NotFound", api_spec)
    end

    operations = [
      %{
        operation: :database_start,
        ability: "start"
      },
      %{
        operation: :database_stop,
        ability: "stop"
      }
    ]

    for %{operation: operation, ability: ability} <- operations do
      @operation operation
      @ability ability

      test "should fallback to not found on operation #{operation} if the database is not found",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/databases/#{UUID.uuid4()}/operations/#{@operation}",
          %{}
        )
        |> json_response(:not_found)
        |> assert_schema("NotFound", api_spec)
      end

      test "should fallback to not found on operation #{operation} if the database is deregistered",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{id: database_id} = insert(:database, deregistered_at: DateTime.utc_now())

        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/databases/#{database_id}/operations/#{@operation}",
          %{}
        )
        |> json_response(:not_found)
        |> assert_schema("NotFound", api_spec)
      end

      test "should fallback to not found on operation #{operation} if requested site is not found in database",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{id: database_id} = insert(:database)
        insert(:database_instance, database_id: database_id, system_replication_site: nil)

        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/databases/#{database_id}/operations/#{@operation}",
          %{"site" => "foo"}
        )
        |> json_response(:not_found)
        |> assert_schema("NotFound", api_spec)
      end

      test "should respond with 500 for operation #{operation} on messaging error", %{conn: conn} do
        %{id: database_id} = insert(:database)

        %{id: host_id} = insert(:host, heartbeat: :passing)

        insert(:database_instance, database_id: database_id, host_id: host_id)

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
            "/api/v1/databases/#{database_id}/operations/#{@operation}",
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

      test "should perform operation #{operation} properly with authorized #{ability} ability",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{id: user_id} = insert(:user)

        %{id: ability_id} = insert(:ability, name: @ability, resource: "database")
        insert(:users_abilities, user_id: user_id, ability_id: ability_id)

        site = "Trento"
        %{id: database_id} = insert(:database)
        %{id: host_id} = insert(:host, heartbeat: :passing)

        insert(:database_instance,
          database_id: database_id,
          host_id: host_id,
          system_replication_site: site
        )

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher,
             _,
             %{
               targets: [
                 %{
                   arguments: %{
                     "instance_number" => %{kind: {:string_value, _}},
                     "site" => %{kind: {:string_value, ^site}},
                     "timeout" => %{kind: {:number_value, 5_000}}
                   }
                 }
               ]
             } ->
            :ok
          end
        )

        posted_conn =
          conn
          |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
          |> put_req_header("content-type", "application/json")
          |> post(
            "/api/v1/databases/#{database_id}/operations/#{@operation}",
            %{
              "site" => site,
              "timeout" => 5_000
            }
          )

        posted_conn
        |> json_response(:accepted)
        |> assert_schema("OperationAccepted", api_spec)

        assert %{
                 assigns: %{
                   database: %{
                     id: ^database_id
                   },
                   operation: operation
                 }
               } = posted_conn

        assert operation == @operation
      end
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
          ),
          post(
            conn,
            "/api/v1/databases/#{database_id}/operations/database_start",
            %{}
          ),
          post(
            conn,
            "/api/v1/databases/#{database_id}/operations/database_stop",
            %{}
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
