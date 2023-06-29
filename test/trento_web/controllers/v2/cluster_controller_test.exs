defmodule TrentoWeb.V2.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Mox
  import Trento.Factory

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
  end
end
