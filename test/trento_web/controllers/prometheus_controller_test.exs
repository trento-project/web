defmodule TrentoWeb.PrometheusControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  test "should return the exepcted targets", %{conn: conn} do
    hosts = Enum.map(0..2, fn _ -> host_projection() end)

    response =
      conn
      |> get(Routes.prometheus_path(conn, :targets))
      |> json_response(200)

    assert Enum.all?(hosts, fn host ->
             %{
               "targets" => ["#{host.ssh_address}:9100"],
               "labels" =>
                 %{
                   "host_id" => "#{host.id}",
                   "hostname" => "#{host.hostname}",
                   "exporter_name" => "Node Exporter"
                 }
             } in response
           end)
  end
end
