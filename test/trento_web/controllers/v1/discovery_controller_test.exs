defmodule TrentoWeb.V1.DiscoveryControllerTest do
  use TrentoWeb.ConnCase, async: true

  describe "discovery" do
    test "collect action should return an unprocessable entity error when the event is unknown",
         %{conn: conn} do
      resp =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/collect", %{
          "discovery_type" => "invalid",
          "agent_id" => UUID.uuid4(),
          "payload" => %{}
        })
        |> json_response(:unprocessable_entity)

      assert %{
               "errors" => [
                 %{"detail" => "Unknown discovery type.", "title" => "Unprocessable Entity"}
               ]
             } = resp
    end

    test "collect action should accept nil payloads",
         %{conn: conn} do
      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/collect", %{
        "discovery_type" => "ha_cluster_discovery",
        "agent_id" => UUID.uuid4(),
        "payload" => nil
      })
      |> json_response(202)
    end
  end
end
