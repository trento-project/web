defmodule TrentoWeb.V1.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  alias Trento.Hosts.Commands.RequestHostDeregistration

  setup [:set_mox_from_context, :verify_on_exit!]

  setup :setup_api_spec_v1
  setup :setup_user

  describe "forbidden routes" do
    test "should return forbidden on request_check_execution controller action when the user does not have all:all or all:hosts_checks_execution abilities",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      conn
      |> post("/api/v1/hosts/host_id/checks/request_execution")
      |> json_response(:forbidden)
      |> assert_schema("Forbidden", api_spec)
    end

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
          post(conn, "/api/v1/hosts/#{host_id}/checks", %{})
        ],
        fn conn ->
          conn
          |> json_response(:forbidden)
          |> assert_schema("Forbidden", api_spec)
        end
      )
    end
  end

  describe "list" do
    test "should list all hosts", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      insert_list(2, :sles_subscription, host_id: host_id)
      insert_list(2, :tag, resource_id: host_id)

      get(conn, "/api/v1/hosts")
      |> json_response(200)
      |> assert_schema("HostsCollection", api_spec)
    end
  end

  describe "heartbeat" do
    test "should return 404 if the host was not found", %{conn: conn} do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn _ ->
          {:error, :host_not_registered}
        end
      )

      resp =
        conn
        |> post("/api/v1/hosts/#{UUID.uuid4()}/heartbeat")
        |> json_response(:not_found)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == resp
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
    test "should perform the request when the user has all:hosts_checks_execution ability", %{
      conn: conn
    } do
      %{id: host_id} = insert(:host)

      %{id: user_id} = insert(:user)

      %{id: ability_id} = insert(:ability, name: "all", resource: "hosts_checks_execution")
      insert(:users_abilities, user_id: user_id, ability_id: ability_id)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn _, _ ->
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
        fn _, _ ->
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
        |> assert_schema("NotFound", api_spec)
      end
    end

    test "should return 422 when the selection is empty", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host, selected_checks: [])

      conn
      |> post("/api/v1/hosts/#{host_id}/checks/request_execution")
      |> json_response(:unprocessable_entity)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 500 on messaging error", %{conn: conn} do
      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn _, _ ->
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
        fn %RequestHostDeregistration{host_id: ^host_id} ->
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
        fn %RequestHostDeregistration{host_id: ^host_id} ->
          {:error, :host_alive}
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> json_response(422)
      |> assert_schema("UnprocessableEntity", api_spec)
    end

    test "should return 404 if the host was not found", %{conn: conn, api_spec: api_spec} do
      %{id: host_id} = insert(:host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %RequestHostDeregistration{host_id: ^host_id} ->
          {:error, :host_not_registered}
        end
      )

      conn
      |> delete("/api/v1/hosts/#{host_id}")
      |> json_response(404)
      |> assert_schema("NotFound", api_spec)
    end
  end
end
