defmodule TrentoWeb.V2.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory

  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  alias TrentoWeb.OpenApi.V2.ApiSpec

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "list" do
    test "should be compliant with ASCS/ERS clusters schema", %{conn: conn} do
      insert(:cluster, details: build(:ascs_ers_cluster_details))

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v2/clusters")
      |> json_response(200)
      |> assert_schema("PacemakerClustersCollection", api_spec)
    end

    test "should be compliant with Hana Cluster details schema", %{conn: conn} do
      insert(:cluster,
        sap_instances:
          build_list(1, :clustered_sap_instance,
            resource_type: SapInstanceResourceType.sap_hana_topology()
          ),
        details:
          build(:hana_cluster_details,
            nodes: build_list(1, :hana_cluster_node)
          )
      )

      api_spec = ApiSpec.spec()

      conn
      |> get("/api/v2/clusters")
      |> json_response(200)
      |> assert_schema("PacemakerClustersCollection", api_spec)
    end
  end
end
