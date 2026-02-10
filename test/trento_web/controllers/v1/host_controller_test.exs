defmodule TrentoWeb.V1.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias Trento.ActivityLog
  alias Trento.Hosts.Commands.RequestHostDeregistration

  alias Trento.Infrastructure.Checks.AMQP.Publisher
  alias Trento.Infrastructure.Operations.AMQP.Publisher, as: OperationsPublisher
  alias Trento.Operations.V1.OperationRequested

  setup [:set_mox_from_context, :verify_on_exit!]

  setup :setup_api_spec_v1
  setup :setup_user

  describe "list" do
    test "should list all hosts", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      insert_list(2, :sles_subscription, host_id: host_id)
      insert_list(2, :tag, resource_id: host_id)

      get(conn, "/api/v1/hosts")
      |> json_response(200)
      |> assert_schema("HostsCollectionV1", api_spec)
    end

    test "should handle null cluster_id", %{conn: conn, api_spec: api_spec} do
      insert(:host, cluster_id: nil)

      get(conn, "/api/v1/hosts")
      |> json_response(200)
      |> assert_schema("HostsCollectionV1", api_spec)
    end

    test "should include cluster information if present", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} =
        insert(:host,
          hostname: "host a",
          cluster_id: cluster_id = Faker.UUID.v4(),
          cluster_host_status: ClusterHostStatus.online()
        )

      %{id: another_host_id} =
        insert(:host, hostname: "host b", cluster_id: nil, cluster_host_status: nil)

      hosts =
        get(conn, "/api/v1/hosts")
        |> json_response(200)
        |> assert_schema("HostsCollectionV1", api_spec)

      host = Enum.find(hosts, fn h -> h.id == host_id end)
      another_host = Enum.find(hosts, fn h -> h.id == another_host_id end)

      assert host.id == host_id
      assert host.cluster_id == cluster_id
      assert host.cluster_host_status == :online

      assert another_host.id == another_host_id
      assert another_host.cluster_id == nil
      assert another_host.cluster_host_status == nil
    end
  end

  describe "heartbeat" do
    for scenario <- [:with_correlation, :without_correlation] do
      @scenario scenario
      test "should return 404 if the host was not found #{@scenario}", %{conn: conn} do
        case @scenario do
          :with_correlation ->
            key0 = UUID.uuid4()
            Process.put(:correlation_key, key0)
            key = ActivityLog.correlation_key(:api_key)
            ActivityLog.put_correlation_id(key, UUID.uuid4())

            expect(
              Trento.Commanded.Mock,
              :dispatch,
              fn _, _ ->
                {:error, :host_not_registered}
              end
            )

          :without_correlation ->
            expect(
              Trento.Commanded.Mock,
              :dispatch,
              fn _ ->
                {:error, :host_not_registered}
              end
            )
        end

        resp =
          conn
          |> post("/api/v1/hosts/#{UUID.uuid4()}/heartbeat")
          |> json_response(:not_found)

        assert %{
                 "errors" => [
                   %{
                     "detail" => "The requested resource cannot be found.",
                     "title" => "Not Found"
                   }
                 ]
               } == resp
      end
    end
  end

  describe "Checks Selection" do
    test "should return 202 when the checks were selected", %{conn: conn} do
      expect(Trento.Commanded.Mock, :dispatch, fn _ ->
        :ok
      end)

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/checks", %{
          "checks" => [Faker.Lorem.word()]
        })
        |> json_response(:accepted)

      assert %{} = resp
    end

    test "should return 404 if the host was not registered", %{conn: conn} do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn _ ->
          {:error, :host_not_registered}
        end
      )

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/checks", %{
          "checks" => [Faker.Lorem.word()]
        })
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
    end

    test "should return 422 on invalid input", %{conn: conn} do
      scenarios = [
        %{
          name: "invalid host id",
          request: fn conn ->
            post(conn, "/api/v1/hosts/an_inv4lid_uuid/checks", %{
              "checks" => [Faker.Lorem.word()]
            })
          end,
          expected_response: %{
            "errors" => [
              %{
                "detail" => "Invalid format. Expected :uuid",
                "source" => %{
                  "pointer" => "/id"
                },
                "title" => "Invalid value"
              }
            ]
          }
        },
        %{
          name: "invalid check",
          request: fn conn ->
            post(conn, "/api/v1/hosts/#{Faker.UUID.v4()}/checks", %{
              "checks" => [Faker.Lorem.word(), 2]
            })
          end,
          expected_response: %{
            "errors" => [
              %{
                "detail" => "Invalid string. Got: integer",
                "source" => %{
                  "pointer" => "/checks/1"
                },
                "title" => "Invalid value"
              }
            ]
          }
        }
      ]

      for %{
            request: request,
            expected_response: expected_response
          } <- scenarios do
        expect(
          Trento.Commanded.Mock,
          :dispatch,
          0,
          fn _ -> nil end
        )

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> request.()
          |> json_response(:unprocessable_entity)

        assert expected_response == resp
      end
    end

    test "should return 500 on any other error", %{conn: conn} do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn _ ->
          {:error, :some_error}
        end
      )

      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/checks", %{
          "checks" => [Faker.Lorem.word()]
        })
        |> json_response(:internal_server_error)

      assert %{
               "errors" => [
                 %{
                   "detail" => "Something went wrong.",
                   "title" => "Internal Server Error"
                 }
               ]
             } == resp
    end
  end

  describe "Request check executions" do
    test "should perform the request when the user has all:host_checks_execution ability", %{
      conn: conn
    } do
      %{id: host_id} = insert(:host)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "all", resource: "host_checks_execution")
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
        |> post("/api/v1/hosts/#{host_id}/checks/request_execution")
        |> json_response(:accepted)

      assert resp == %{}
    end

    test "should return 202 when the execution was successfully started", %{conn: conn} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, _, _ ->
          :ok
        end
      )

      resp =
        conn
        |> post("/api/v1/hosts/#{host_id}/checks/request_execution")
        |> json_response(:accepted)

      assert resp == %{}
    end

    test "should return 404 when the host is not found", %{conn: conn, api_spec: api_spec} do
      %{id: deregistered_host} = insert(:host, deregistered_at: DateTime.utc_now())

      for host_id <- [deregistered_host, Faker.UUID.v4()] do
        conn
        |> post("/api/v1/hosts/#{host_id}/checks/request_execution")
        |> json_response(:not_found)
        |> assert_schema("NotFoundV1", api_spec)
      end
    end

    test "should return 422 when the selection is empty", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host, selected_checks: [])

      conn
      |> post("/api/v1/hosts/#{host_id}/checks/request_execution")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntityV1", api_spec)
    end

    test "should return 500 on messaging error", %{conn: conn} do
      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, _, _ ->
          {:error, :amqp_error}
        end
      )

      %{id: host_id} = insert(:host)

      resp =
        conn
        |> post("/api/v1/hosts/#{host_id}/checks/request_execution")
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

  describe "delete" do
    test "should send 204 response when successful host deletion", %{conn: conn} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %RequestHostDeregistration{host_id: ^host_id}, _ ->
          :ok
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> response(204)
    end

    test "should send 422 response if the host is still alive", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %RequestHostDeregistration{host_id: ^host_id}, _ ->
          {:error, :host_alive}
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> json_response(422)
      |> assert_schema("UnprocessableEntityV1", api_spec)
    end

    test "should return 404 if the host was not found", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %RequestHostDeregistration{host_id: ^host_id}, _ ->
          {:error, :host_not_registered}
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> json_response(404)
      |> assert_schema("NotFoundV1", api_spec)
    end

    test "should allow the request when the user has cleanup:host ability", %{
      conn: conn
    } do
      %{id: host_id} = insert(:host)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "cleanup", resource: "host")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %RequestHostDeregistration{host_id: ^host_id}, _ ->
          :ok
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> response(204)
    end
  end

  describe "request operation" do
    for operation <- [:saptune_solution_apply, :saptune_solution_change] do
      @op operation
      test "should respond with 422 if operation #{@op} receives an unsupported params payload",
           %{
             conn: conn
           } do
        %{id: host_id} = insert(:host)

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> post("/api/v1/hosts/#{host_id}/operations/#{@op}", %{})
          |> json_response(:unprocessable_entity)

        assert %{
                 "errors" => [
                   %{
                     "detail" => "Missing field: solution",
                     "source" => %{"pointer" => "/solution"},
                     "title" => "Invalid value"
                   }
                 ]
               } == resp
      end
    end

    # test all common responses for the requested operations
    # the table below contains the operations to be tested and a sample host
    # with the required preconditions to allow the operation
    # more specific tests for each operation can be added outside this loop
    for {operation, operation_type, host} <- [
          {"saptune_solution_apply", "saptuneapplysolution@v1",
           build(:host, saptune_status: nil)},
          {"saptune_solution_change", "saptunechangesolution@v1",
           build(:host, saptune_status: build(:saptune_status))},
          {"reboot", "hostreboot@v1",
           build(:host, application_instances: [], database_instances: [], cluster_id: nil)}
        ] do
      @operation operation
      @operation_type operation_type
      @host host

      test "should fallback to not found for operation '#{operation}' if the resource is not found",
           %{
             conn: conn,
             api_spec: api_spec
           } do
        conn
        |> post("/api/v1/hosts/#{UUID.uuid4()}/operations/#{@operation}")
        |> json_response(:not_found)
        |> assert_schema("NotFoundV1", api_spec)
      end

      test "should respond with 500 on messaging error for operation '#{operation}'",
           %{
             conn: conn
           } do
        %{id: host_id} = insert(@host)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher, _, %OperationRequested{operation_type: @operation_type} ->
            {:error, :amqp_error}
          end
        )

        resp =
          conn
          |> put_req_header("content-type", "application/json")
          |> post("/api/v1/hosts/#{host_id}/operations/#{@operation}", %{
            "solution" => "HANA"
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

      test "should perform '#{operation}' operation when the user has #{operation}:host ability",
           %{
             conn: conn
           } do
        %{id: host_id} = insert(@host)

        %{id: user_id} = insert(:user)

        %{id: ability_id} = insert(:ability, name: @operation, resource: "host")
        insert(:users_abilities, user_id: user_id, ability_id: ability_id)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher, _, %OperationRequested{operation_type: @operation_type} ->
            :ok
          end
        )

        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{host_id}/operations/#{@operation}", %{
          "solution" => "HANA"
        })
        |> json_response(:accepted)
      end

      test "should request '#{operation}' operation", %{
        conn: conn,
        api_spec: api_spec
      } do
        %{id: host_id} = insert(@host)

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn OperationsPublisher, _, %OperationRequested{operation_type: @operation_type} ->
            :ok
          end
        )

        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{host_id}/operations/#{@operation}", %{
          "solution" => "HANA"
        })
        |> json_response(:accepted)
        |> assert_schema("OperationAcceptedV1", api_spec)
      end
    end

    test "should fallback to operation not found if the operation is not found", %{
      conn: conn,
      api_spec: api_spec
    } do
      %{id: host_id} = insert(:host)

      conn
      |> post("/api/v1/hosts/#{host_id}/operations/unknown")
      |> json_response(:not_found)
      |> assert_schema("NotFoundV1", api_spec)
    end
  end

  test "should load host with needed additional resources", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: cluster_id} = insert(:cluster, type: :hana_scale_up)
    %{id: host_id} = insert(:host, cluster_id: cluster_id, cluster_host_status: :offline)
    database_instances = insert_list(2, :database_instance, host_id: host_id)
    application_instances = insert_list(2, :application_instance, host_id: host_id)

    expect(
      Trento.Infrastructure.Messaging.Adapter.Mock,
      :publish,
      fn OperationsPublisher, _, %OperationRequested{} ->
        :ok
      end
    )

    posted_conn =
      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/hosts/#{host_id}/operations/reboot", %{})

    posted_conn
    |> json_response(:accepted)
    |> assert_schema("OperationAcceptedV1", api_spec)

    assert %{
             assigns: %{
               host: %{
                 id: ^host_id,
                 database_instances: ^database_instances,
                 application_instances: ^application_instances,
                 cluster: %{
                   id: ^cluster_id
                 }
               }
             }
           } = posted_conn
  end

  for {saptune_operation, saptune_status} <- [
        {"saptune_solution_apply", nil},
        {"saptune_solution_change", build(:saptune_status)}
      ] do
    @saptune_operation saptune_operation
    @saptune_status saptune_status

    test "should forbid operation '#{saptune_operation}' if conditions are unmet",
         %{
           conn: conn,
           api_spec: api_spec
         } do
      %{id: host_id} = insert(:host, saptune_status: @saptune_status)
      insert(:application_instance, host_id: host_id, health: Health.passing())

      conn
      |> post("/api/v1/hosts/#{host_id}/operations/#{@saptune_operation}")
      |> json_response(:forbidden)
      |> assert_schema("ForbiddenV1", api_spec)
    end
  end

  test "should forbid operation 'reboot' if conditions are unmet",
       %{
         conn: conn,
         api_spec: api_spec
       } do
    %{id: host_id} =
      insert(:host,
        cluster_id: nil,
        application_instances: [
          build(:application_instance, health: Health.passing())
        ],
        database_instances: []
      )

    conn
    |> post("/api/v1/hosts/#{host_id}/operations/reboot")
    |> json_response(:forbidden)
    |> assert_schema("ForbiddenV1", api_spec)
  end

  describe "forbidden response" do
    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)
      %{id: host_id} = insert(:host)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      Enum.each(
        [
          post(conn, "/api/v1/hosts/#{host_id}/checks", %{}),
          post(conn, "/api/v1/hosts/#{host_id}/checks/request_execution", %{}),
          delete(conn, "/api/v1/hosts/#{host_id}"),
          post(conn, "/api/v1/hosts/#{host_id}/operations/saptune_solution_apply", %{}),
          post(conn, "/api/v1/hosts/#{host_id}/operations/saptune_solution_change", %{})
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
