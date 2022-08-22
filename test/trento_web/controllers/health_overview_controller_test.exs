defmodule TrentoWeb.HealthOverviewControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  test "should return the expected overview", %{conn: conn} do
    %{
      sap_system_id: sap_system_id,
      sid: sid
    } = sap_system_with_cluster_and_hosts()

    conn = get(conn, Routes.health_overview_path(conn, :overview))

    assert 200 == conn.status

    assert [
             %{
               "id" => "#{sap_system_id}",
               "sid" => "#{sid}",
               "sapsystem_health" => "passing",
               "database_health" => "critical",
               "clusters_health" => "warning",
               "hosts_health" => "unknown"
             }
           ] == json_response(conn, 200)
  end
end
