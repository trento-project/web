defmodule TrentoWeb.V1.DiscoveryControllerTest do
  use TrentoWeb.ConnCase, async: true

  describe "discovery" do
    test "collect action should return bad request when the payload is invalid", %{conn: conn} do
      resp =
        conn
        |> post("/api/v1/collect", %{"something" => "invalid"})
        |> json_response(:bad_request)

      assert %{"error" => "An error occurred in handling the discovery event."} = resp
    end
  end
end
