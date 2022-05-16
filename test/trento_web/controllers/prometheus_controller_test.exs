defmodule TrentoWeb.PrometheusControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Mox
  import Trento.Factory

  test "should return the exepcted targets", %{conn: conn} do
    hosts = Enum.map(0..2, fn _ -> insert(:host) end)

    response =
      conn
      |> get(Routes.prometheus_path(conn, :targets))
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
      |> get(Routes.prometheus_path(conn, :exporters_status, Faker.UUID.v4()))
      |> json_response(200)

    assert %{"Node Exporter" => "passing"} == response
  end

  test "should return a 500 if the exporters status cannot be fetched", %{conn: conn} do
    expect(Trento.Integration.Prometheus.Mock, :get_exporters_status, fn _ ->
      {:error, :reason}
    end)

    conn
    |> get(Routes.prometheus_path(conn, :exporters_status, Faker.UUID.v4()))
    |> json_response(500)
  end
end
