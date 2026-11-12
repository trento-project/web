# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

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
      |> assert_schema("DatabasesCollectionV1", api_spec)
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
      |> assert_schema("UnprocessableEntityV1", api_spec)
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
      |> assert_schema("NotFoundV1", api_spec)
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
      |> assert_schema("NotFoundV1", api_spec)
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
        |> assert_schema("NotFoundV1", api_spec)
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
        |> assert_schema("NotFoundV1", api_spec)
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
        |> assert_schema("NotFoundV1", api_spec)
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
        %{id: cluster_id} = insert(:cluster)
        %{id: host_id} = insert(:host, heartbeat: :passing, cluster_id: cluster_id)

        insert(:database_instance,
          database_id: database_id,
          host_id: host_id,
          system_replication_site: site
        )

        %{id: sap_system_id} = insert(:sap_system, database_id: database_id)
        insert(:application_instance, sap_system_id: sap_system_id, host_id: host_id)

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
        |> assert_schema("OperationAcceptedV1", api_spec)

        assert %{
                 assigns: %{
                   database: %{
                     id: ^database_id,
                     database_instances: [
                       %{
                         database_id: ^database_id,
                         host: %{
                           id: ^host_id,
                           cluster: %{id: ^cluster_id}
                         }
                       }
                     ],
                     sap_systems: [
                       %{
                         id: ^sap_system_id,
                         application_instances: [
                           %{
                             sap_system_id: ^sap_system_id
                           }
                         ]
                       }
                     ]
                   },
                   operation: operation
                 }
               } = posted_conn

        assert operation == @operation
      end
    end
  end

  describe "database bulk operations" do
    bulk_operation_scenarios = [
      %{
        operation: "database_start",
        ability: "start"
      },
      %{
        operation: "database_stop",
        ability: "stop"
      }
    ]

    for %{operation: operation, ability: ability} <- bulk_operation_scenarios do
      @operation operation
      @ability ability
      @arguments %{"params" => %{"timeout" => 300}}

      test "should respond with 422 if the database ids are missing or empty for #{@operation}",
           %{conn: conn} do
        for body <- [@arguments, Map.put(@arguments, "database_ids", [])] do
          conn
          |> put_req_header("content-type", "application/json")
          |> post("/api/v1/databases/operations/#{@operation}/bulk", body)
          |> json_response(:unprocessable_entity)
        end
      end

      test "should respond with 422 if the database ids contain duplicates for #{@operation}",
           %{conn: conn} do
        %{id: database_id} = insert(:database)
        %{id: host_id} = insert(:host, heartbeat: :passing)
        insert(:database_instance, database_id: database_id, host_id: host_id)

        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/databases/operations/#{@operation}/bulk",
          Map.put(@arguments, "database_ids", [database_id, database_id])
        )
        |> json_response(:unprocessable_entity)
      end

      test "should respond with 404 if any database is not found for #{@operation}", %{
        conn: conn,
        api_spec: api_spec
      } do
        %{id: database_id} = insert(:database)
        %{id: host_id} = insert(:host, heartbeat: :passing)
        insert(:database_instance, database_id: database_id, host_id: host_id)
        missing_database_id = UUID.uuid4()

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> post(
            "/api/v1/databases/operations/#{@operation}/bulk",
            Map.put(@arguments, "database_ids", [database_id, missing_database_id])
          )
          |> json_response(:not_found)

        assert_schema(resp, "NotFoundV1", api_spec)

        assert %{
                 "errors" => [
                   %{"detail" => "Databases not found: " <> ^missing_database_id <> "."}
                 ]
               } = resp
      end

      test "should respond with 404 if a database is deregistered for #{@operation}", %{
        conn: conn,
        api_spec: api_spec
      } do
        %{id: database_id} = insert(:database, deregistered_at: DateTime.utc_now())

        conn
        |> put_req_header("content-type", "application/json")
        |> post(
          "/api/v1/databases/operations/#{@operation}/bulk",
          Map.put(@arguments, "database_ids", [database_id])
        )
        |> json_response(:not_found)
        |> assert_schema("NotFoundV1", api_spec)
      end

      test "should respond with 403 if any database is not authorized for #{@operation}", %{
        conn: conn,
        api_spec: api_spec
      } do
        %{id: authorized_database_id} = insert(:database)
        %{id: authorized_host_id} = insert(:host, heartbeat: :passing)

        insert(:database_instance,
          database_id: authorized_database_id,
          host_id: authorized_host_id
        )

        %{id: unauthorized_database_id, sid: unauthorized_sid} = insert(:database)
        %{id: unauthorized_host_id} = insert(:host, heartbeat: :critical)

        insert(:database_instance,
          database_id: unauthorized_database_id,
          host_id: unauthorized_host_id,
          system_replication_site: nil
        )

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> post(
            "/api/v1/databases/operations/#{@operation}/bulk",
            Map.put(@arguments, "database_ids", [authorized_database_id, unauthorized_database_id])
          )
          |> json_response(:forbidden)

        assert_schema(resp, "ForbiddenV1", api_spec)

        assert %{
                 "errors" => [
                   %{
                     "detail" =>
                       "Trento agent is not currently running in any of the hosts in the database",
                     "resource" => %{
                       "id" => ^unauthorized_database_id,
                       "label" => ^unauthorized_sid,
                       "type" => "database"
                     }
                   }
                 ]
               } = resp
      end

      test "should respond with 500 on messaging error for #{@operation}", %{conn: conn} do
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
            "/api/v1/databases/operations/#{@operation}/bulk",
            Map.put(@arguments, "database_ids", [database_id])
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

      test "should perform bulk #{@operation} operation when the user has #{@ability}:database ability",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        %{id: user_id} = insert(:user)

        %{id: ability_id} = insert(:ability, name: @ability, resource: "database")
        insert(:users_abilities, user_id: user_id, ability_id: ability_id)

        %{id: database_id_1} = insert(:database)
        %{id: database_id_2} = insert(:database)
        %{id: host_id_1} = insert(:host, heartbeat: :passing)
        %{id: host_id_2} = insert(:host, heartbeat: :passing)

        insert(:database_instance, database_id: database_id_1, host_id: host_id_1)
        insert(:database_instance, database_id: database_id_2, host_id: host_id_2)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          2,
          fn OperationsPublisher,
             _,
             %{
               targets: [
                 %{
                   arguments: %{
                     "instance_number" => %{kind: {:string_value, _}},
                     "timeout" => %{kind: {:number_value, 300}}
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
            "/api/v1/databases/operations/#{@operation}/bulk",
            Map.put(@arguments, "database_ids", [database_id_1, database_id_2])
          )

        resp = json_response(posted_conn, :accepted)

        assert_schema(resp, "BulkOperationAcceptedV1", api_spec)

        assert %{
                 "operations" => [
                   %{"resource_id" => ^database_id_1},
                   %{"resource_id" => ^database_id_2}
                 ],
                 "failed_requests" => []
               } = resp

        assert %{assigns: %{database: [%{id: ^database_id_1}, %{id: ^database_id_2}]}} =
                 posted_conn
      end

      test "should accept the bulk #{@operation} request when optional params are not given",
           %{conn: conn, api_spec: api_spec} do
        for body <- [%{}, %{"params" => %{}}] do
          %{id: database_id} = insert(:database)
          %{id: host_id} = insert(:host, heartbeat: :passing)
          insert(:database_instance, database_id: database_id, host_id: host_id)

          expect(
            Trento.Infrastructure.Messaging.Adapter.Mock,
            :publish,
            fn OperationsPublisher, _, _ ->
              :ok
            end
          )

          conn
          |> put_req_header("content-type", "application/json")
          |> post(
            "/api/v1/databases/operations/#{@operation}/bulk",
            Map.put(body, "database_ids", [database_id])
          )
          |> json_response(:accepted)
          |> assert_schema("BulkOperationAcceptedV1", api_spec)
        end
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
          ),
          post(conn, "/api/v1/databases/operations/database_start/bulk", %{
            "database_ids" => [database_id]
          }),
          post(conn, "/api/v1/databases/operations/database_stop/bulk", %{
            "database_ids" => [database_id]
          })
        ],
        fn conn ->
          conn
          |> json_response(:forbidden)
          |> assert_schema("ForbiddenV1", api_spec)
        end
      )
    end
  end
end
