defmodule TrentoWeb.V1.DiscoveryControllerTest do
  use TrentoWeb.ConnCase, async: true

  describe "discovery" do
    test "collect action should return bad request when the event is unknown", %{conn: conn} do
      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/collect", %{"discovery_type" => "invalid", "agent_id" => UUID.uuid4()})
        |> json_response(:unprocessable_entity)

      assert %{"errors" => [%{"detail" => "Unknown discovery type", "title" => "Invalid value"}]} =
               resp
    end
  end
end
