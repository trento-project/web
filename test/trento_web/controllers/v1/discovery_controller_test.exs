defmodule TrentoWeb.V1.DiscoveryControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.DiscoveryFixturesHelper

  import Mox

  alias Trento.Discovery

  alias Trento.Discovery.DiscardedDiscoveryEvent

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

    test "collect action discards and store events when the command fails",
         %{conn: conn} do
      body =
        load_discovery_event_fixture("sap_system_discovery_application")

      expect(Trento.Commanded.Mock, :dispatch, fn _ ->
        {:error, :any_reason}
      end)

      %{status: status} =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/collect", body)

      assert status != 202

      [discarded_event] = Discovery.get_discarded_discovery_events(1)

      assert %DiscardedDiscoveryEvent{payload: ^body, reason: "[:any_reason]"} =
               discarded_event
    end

    test "collect action discards and store events when the command is not dispatched",
         %{conn: conn} do
      body =
        load_discovery_event_fixture("sap_system_discovery_application")

      expect(Trento.Commanded.Mock, :dispatch, fn _ ->
        {:ignore, :any_reason}
      end)

      %{status: status} =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/collect", body)

      assert status == 202

      [discarded_event] = Discovery.get_discarded_discovery_events(1)

      assert %DiscardedDiscoveryEvent{payload: ^body, reason: "[:any_reason]"} =
               discarded_event
    end
  end
end
