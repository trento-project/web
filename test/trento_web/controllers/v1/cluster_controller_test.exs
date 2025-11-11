defmodule TrentoWeb.V1.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias TrentoWeb.OpenApi.V1.ApiSpec

  alias Trento.Infrastructure.Checks.AMQP.Publisher
  alias Trento.Infrastructure.Operations.AMQP.Publisher, as: OperationsPublisher

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  setup [:set_mox_from_context, :verify_on_exit!]

  setup :setup_api_spec_v1
  setup :setup_user

  describe "list" do
    test "should list all clusters", %{conn: conn} do
      insert_list(2, :cluster)

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v1/clusters")
      |> json_response(200)
      |> assert_schema("PacemakerClustersCollectionV1", api_spec)
    end
  end

  describe "select_checks" do
    test "should return 202 when the checks were selected", %{conn: conn} do
      expect(Trento.Commanded.Mock, :dispatch, fn _ ->
        :ok
      end)

      cluster_id = UUID.uuid4()

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/checks", %{
          "checks" => ["string"]
        })
        |> json_response(:accepted)

      assert %{} = resp
    end
  end

  describe "request check executions" do
    test "should perform the request when the user has all:cluster_checks_execution ability", %{
      conn: conn
    } do
      %{id: cluster_id} = insert(:cluster)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "all", resource: "cluster_checks_execution")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, _, _ ->
          :ok
        end
      )

      resp =
        conn
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution")
        |> json_response(:accepted)

      assert resp == %{}
    end

    test "should return 404 when the cluster is not found", %{conn: conn} do
      cluster_id = UUID.uuid4()

      resp =
        conn
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution", %{})
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
    end

    test "should return 422 when the selection is empty", %{conn: conn} do
      %{id: cluster_id} = insert(:cluster, selected_checks: [])

      resp =
        conn
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution")
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "title" => "Unprocessable Entity",
                   "detail" => "No checks were selected for the target."
                 }
               ]
             } == resp
    end

    test "should return 500 if messaging returns an error", %{conn: conn} do
      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, _, _ ->
          {:error, :amqp_error}
        end
      )

      %{id: cluster_id} = insert(:cluster)

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/checks/request_execution", %{})
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
  end

  describe "cluster maintenance operations" do
    test "should fallback to not found if the resource is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> post("/api/v1/clusters/#{UUID.uuid4()}/operations/cluster_maintenance_change")
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should fallback to operation not found if the operation is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: cluster_id} = insert(:cluster)

      conn
      |> post("/api/v1/clusters/#{cluster_id}/operations/unknown")
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should respond with 422 if cluster maintenance change does not receive needed params",
         %{
           conn: conn
         } do
      %{id: cluster_id} = insert(:cluster)

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/operations/cluster_maintenance_change", %{})
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Failed to cast value to one of: no schemas validate",
                   "source" => %{"pointer" => "/"},
                   "title" => "Invalid value"
                 },
                 %{
                   "detail" => "Missing field: maintenance",
                   "source" => %{"pointer" => "/maintenance"},
                   "title" => "Invalid value"
                 }
               ]
             } == resp
    end

    test "should respond with 500 on messaging error", %{conn: conn} do
      %{id: cluster_id} = insert(:cluster)
      insert(:host, cluster_id: cluster_id)

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
        |> post("/api/v1/clusters/#{cluster_id}/operations/cluster_maintenance_change", %{
          "maintenance" => true
        })
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

    test "should perform cluster maintenance change operation when the user has maintenance_change:cluster ability",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      %{id: cluster_id} = insert(:cluster)
      %{id: host_id} = insert(:host, cluster_id: cluster_id)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "maintenance_change", resource: "cluster")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn OperationsPublisher, _, _ ->
          :ok
        end
      )

      posted_conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/operations/cluster_maintenance_change", %{
          "maintenance" => true
        })

      posted_conn
      |> json_response(:accepted)
      |> assert_schema("OperationAcceptedV1", api_spec)

      assert %{
               assigns: %{
                 cluster: %{
                   id: ^cluster_id,
                   hosts: [
                     %{
                       id: ^host_id
                     }
                   ]
                 }
               }
             } = posted_conn
    end
  end

  describe "cluster host operations" do
    #
    # Generic cluster host operation tests
    #

    # the operation is arbitrary, we just need an existing one
    @any_existing_operation "pacemaker_enable"

    # the host is built to serve as an example of an allowed scenario for the test operation
    @any_allowed_scenario_host build(:host,
                                 cluster_id: UUID.uuid4(),
                                 systemd_units: [
                                   build(:host_systemd_unit,
                                     name: "pacemaker.service",
                                     unit_file_state: "disabled"
                                   )
                                 ]
                               )

    test "should return not found if the operation on unmapped operation", %{
      conn: conn,
      api_spec: api_spec
    } do
      conn
      |> post("/api/v1/clusters/#{UUID.uuid4()}/hosts/#{UUID.uuid4()}/operations/unknown")
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should return not found when requesting an operation for a non existent cluster",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      conn
      |> post(
        "/api/v1/clusters/#{UUID.uuid4()}/hosts/#{UUID.uuid4()}/operations/#{@any_existing_operation}"
      )
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should return not found when requesting an operation for a deregistered cluster",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      %{id: cluster_id} = insert(:cluster, deregistered_at: Faker.DateTime.backward(1))

      conn
      |> post(
        "/api/v1/clusters/#{cluster_id}/hosts/#{UUID.uuid4()}/operations/#{@any_existing_operation}"
      )
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should return not found when requesting an operation for a host not part of the cluster",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      %{id: cluster_id_1} = insert(:cluster)

      %{id: cluster_id_2} = insert(:cluster)
      insert(:host, cluster_id: cluster_id_2)

      %{id: cluster_id_3} = insert(:cluster)
      insert(:host, cluster_id: cluster_id_3, deregistered_at: nil)

      %{id: deregistered_host_id} =
        insert(:host, cluster_id: cluster_id_3, deregistered_at: Faker.DateTime.backward(1))

      for {cluster_id, host_id} <- [
            {cluster_id_1, Faker.UUID.v4()},
            {cluster_id_2, Faker.UUID.v4()},
            {cluster_id_3, deregistered_host_id}
          ] do
        conn
        |> post(
          "/api/v1/clusters/#{cluster_id}/hosts/#{host_id}/operations/#{@any_existing_operation}"
        )
        |> json_response(:not_found)
        |> assert_schema("NotFoundV1", api_spec)
      end
    end

    test "should return 500 when requesting an operation on messaging error", %{conn: conn} do
      %{id: host_id, cluster_id: cluster_id} =
        insert(@any_allowed_scenario_host)

      insert(:cluster, id: cluster_id)

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
          "/api/v1/clusters/#{cluster_id}/hosts/#{host_id}/operations/#{@any_existing_operation}"
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

    test "should successfully perform an operation when the user has :cluster ability",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      %{id: user_id} = insert(:user)
      %{id: ability_id} = insert(:ability, name: @any_existing_operation, resource: "cluster")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      %{id: host_id, cluster_id: cluster_id} =
        insert(@any_allowed_scenario_host)

      insert(:cluster, id: cluster_id)

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn OperationsPublisher, _, _ ->
          :ok
        end
      )

      conn
      |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
      |> put_req_header("content-type", "application/json")
      |> post(
        "/api/v1/clusters/#{cluster_id}/hosts/#{host_id}/operations/#{@any_existing_operation}"
      )
      |> json_response(:accepted)
      |> assert_schema("OperationAcceptedV1", api_spec)
    end

    #
    # Pacemaker enable/disable specific scenarios
    #

    for %{name: name} = scenario <- [
          %{
            name: "enable disabled pacemaker",
            operation: "pacemaker_enable",
            host_units: [
              build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "disabled")
            ]
          },
          %{
            name: "disable enabled pacemaker",
            operation: "pacemaker_disable",
            host_units: [
              build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "enabled")
            ]
          }
        ] do
      @allowed_scenario scenario

      test "should allow to #{name}", %{
        conn: conn,
        api_spec: api_spec,
        admin_user: %{id: user_id}
      } do
        %{
          operation: operation,
          host_units: host_units
        } = @allowed_scenario

        %{id: cluster_id} = insert(:cluster)

        %{id: host_id} =
          insert(:host,
            cluster_id: cluster_id,
            systemd_units: host_units
          )

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher, _, _ ->
            :ok
          end
        )

        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/hosts/#{host_id}/operations/#{operation}")
        |> json_response(:accepted)
        |> assert_schema("OperationAcceptedV1", api_spec)
      end
    end

    for %{name: name} = scenario <-
          [
            %{
              name: "enable already enabled pacemaker",
              operation: "pacemaker_enable",
              host_units: [
                build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "enabled")
              ]
            },
            %{
              name: "disable already disabled pacemaker",
              operation: "pacemaker_disable",
              host_units: [
                build(:host_systemd_unit,
                  name: "pacemaker.service",
                  unit_file_state: "disabled"
                )
              ]
            },
            %{
              name: "enable enabled pacemaker when it is in an unrecognized state",
              operation: "pacemaker_enable",
              host_units: [
                build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "foo")
              ]
            },
            %{
              name: "disable pacemaker when it is in an unrecognized state",
              operation: "pacemaker_disable",
              host_units: [
                build(:host_systemd_unit, name: "pacemaker.service", unit_file_state: "bar")
              ]
            }
          ] do
      @unauthorized_scenario scenario

      test "should return 403 when attempting to #{name}", %{
        conn: conn,
        api_spec: api_spec,
        admin_user: %{id: user_id}
      } do
        %{
          operation: operation,
          host_units: host_units
        } = @unauthorized_scenario

        %{id: cluster_id} = insert(:cluster)

        %{id: host_id} =
          insert(:host,
            cluster_id: cluster_id,
            systemd_units: host_units
          )

        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{cluster_id}/hosts/#{host_id}/operations/#{operation}")
        |> json_response(:forbidden)
        |> assert_schema("ForbiddenV1", api_spec)
      end
    end
  end

  describe "forbidden response" do
    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      %{id: cluster_id} = insert(:cluster)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      Enum.each(
        [
          post(conn, "/api/v1/clusters/#{cluster_id}/checks", %{}),
          post(conn, "/api/v1/clusters/#{cluster_id}/checks/request_execution", %{}),
          post(conn, "/api/v1/clusters/#{cluster_id}/operations/cluster_maintenance_change", %{}),
          post(
            conn,
            "/api/v1/clusters/#{cluster_id}/hosts/#{UUID.uuid4()}/operations/pacemaker_enable"
          ),
          post(
            conn,
            "/api/v1/clusters/#{cluster_id}/hosts/#{UUID.uuid4()}/operations/pacemaker_disable"
          ),
          post(
            conn,
            "/api/v1/clusters/#{cluster_id}/hosts/#{UUID.uuid4()}/operations/cluster_host_start"
          ),
          post(
            conn,
            "/api/v1/clusters/#{cluster_id}/hosts/#{UUID.uuid4()}/operations/cluster_host_stop"
          )
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
