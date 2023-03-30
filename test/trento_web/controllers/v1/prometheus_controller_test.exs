defmodule TrentoWeb.V1.PrometheusControllerTest do
  use TrentoWeb.ConnCase, async: true

  alias TrentoWeb.OpenApi.ApiSpec

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory

  test "should return the expected targets", %{conn: conn} do
    insert_list(2, :host)
    api_spec = ApiSpec.spec()

    conn
    |> get("/api/v1/prometheus/targets")
    |> json_response(200)
    |> assert_schema("HttpSTDTargetList", api_spec)
  end

  test "should return the expected targets when some host does not have any IP address", %{
    conn: conn
  } do
    %{id: id, hostname: hostname} = insert(:host, ip_addresses: [])

    response =
      conn
      |> get("/api/v1/prometheus/targets")
      |> json_response(200)

    %{
      "targets" => ["#{hostname}:9100"],
      "labels" => %{
        "agentID" => "#{id}",
        "hostname" => "#{hostname}",
        "exporter_name" => "Node Exporter"
      }
    } in response
  end

  test "should return the exporters status", %{conn: conn} do
    expect(Trento.Integration.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:ok, %{"Node Exporter" => :passing}}
    end)

    response =
      conn
      |> get("/api/v1/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(200)

    assert %{"Node Exporter" => "passing"} == response
  end

  test "should return 404 if the host is not registered", %{conn: conn} do
    expect(Trento.Integration.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:error, :host_not_found}
    end)

    response =
      conn
      |> get("/api/v1/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(404)

    assert %{
             "errors" => [
               %{
                 "detail" => "Host not found",
                 "title" => "Not Found"
               }
             ]
           } = response
  end

  test "should return a 500 if the exporters status cannot be fetched", %{conn: conn} do
    expect(Trento.Integration.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:error, :reason}
    end)

    response =
      conn
      |> get("/api/v1/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(500)

    assert %{
             "errors" => [
               %{
                 "detail" => "An error occurred in getting exporters status.",
                 "title" => "Internal Server Error"
               }
             ]
           } = response
  end
end
