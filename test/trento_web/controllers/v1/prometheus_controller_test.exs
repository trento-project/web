defmodule TrentoWeb.V1.PrometheusControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Mox
  import Trento.Factory

  test "should return the expected targets", %{conn: conn} do
    hosts = insert_list(2, :host)

    response =
      conn
      |> get("/api/v1/prometheus/targets")
      |> json_response(200)

    assert Enum.all?(hosts, fn %{id: id, hostname: hostname, ip_addresses: [ip_address | _]} ->
             %{
               "targets" => ["#{ip_address}:9100"],
               "labels" => %{
                 "agentID" => "#{id}",
                 "hostname" => "#{hostname}",
                 "exporter_name" => "Node Exporter"
               }
             } in response
           end)
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

  @tag capture_log: true
  test "should return a 500 if the exporters status cannot be fetched", %{conn: conn} do
    expect(Trento.Integration.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:error, :reason}
    end)

    resp =
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
           } = resp
  end
end
