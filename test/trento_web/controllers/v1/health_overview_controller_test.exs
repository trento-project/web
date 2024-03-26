defmodule TrentoWeb.V1.HealthOverviewControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Trento.Factory

  alias TrentoWeb.OpenApi.V1.ApiSpec

  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  alias Trento.ClusterReadModel
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  test "should return the expected overview", %{conn: conn} do
    %ClusterReadModel{id: cluster_id} =
      insert(:cluster, type: ClusterType.hana_scale_up(), health: Health.passing())

    %HostReadModel{id: host_1_id} = insert(:host, cluster_id: cluster_id, heartbeat: :unknown)

    %SapSystemReadModel{
      id: sap_system_id,
      sid: sid,
      database_id: database_id
    } = insert(:sap_system, health: Health.critical())

    insert(
      :database_instance_without_host,
      database_id: database_id,
      sid: "HDD",
      host_id: host_1_id,
      health: Health.warning()
    )

    insert(
      :application_instance_without_host,
      sap_system_id: sap_system_id,
      sid: sid,
      host_id: host_1_id,
      health: Health.critical()
    )

    conn = get(conn, "/api/v1/sap_systems/health")

    assert 200 == conn.status

    api_spec = ApiSpec.spec()

    assert_schema(json_response(conn, 200), "HealthOverview", api_spec)
  end
end
