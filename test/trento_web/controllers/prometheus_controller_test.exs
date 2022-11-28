defmodule TrentoWeb.PrometheusControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Mox
  import Trento.Factory

  test "should return the expected targets", %{conn: conn} do
    hosts = insert_list(2, :host)

    response =
      conn
      |> get("/api/prometheus/targets")
      |> json_response(200)

    assert Enum.all?(hosts, fn host ->
             %{
               "targets" => ["#{host.ssh_address}:9100"],
               "labels" => %{
                 "agentID" => "#{host.id}",
                 "hostname" => "#{host.hostname}",
                 "exporter_name" => "Node Exporter"
               }
             } in response
           end)
  end

  test "should return the exporters status", %{conn: conn} do
    expect(Trento.Integration.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:ok, %{"Node Exporter" => :passing}}
    end)

    response =
      conn
      |> get("/api/hosts/#{Faker.UUID.v4()}/exporters_status")
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
      |> get("/api/hosts/#{Faker.UUID.v4()}/exporters_status")
      |> json_response(500)

    assert %{"error" => "An error occurred in getting exporters status."} = resp
  end
end
