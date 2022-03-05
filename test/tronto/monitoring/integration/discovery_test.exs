defmodule Tronto.Monitoring.Integration.DiscoveryTest do
  use ExUnit.Case

  import Tronto.DiscoveryFixturesHelper

  alias Tronto.Monitoring.Integration.Discovery

  alias Tronto.Monitoring.Domain.Commands.UpdateProvider

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  describe "cloud_discovery" do
    test "cloud_discovery payload with azure provider should return the expected commands" do
      assert {
               :ok,
               %UpdateProvider{
                 host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
                 provider: "azure"
               }
             } =
               "cloud_discovery_azure"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end
  end

  describe "sap_system_discovery" do
    test "sap_system_discovery payload of type database parsing should return the expected commands" do
      assert {:ok,
              [
                %RegisterDatabaseInstance{
                  features: "HDB|HDB_WORKER",
                  host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                  instance_number: "00",
                  sap_system_id: "1118a8f8-e892-5a6f-a1a8-df31260cde44",
                  sid: "PRD",
                  tenant: "PRD"
                }
              ]} =
               "sap_system_discovery_database"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end

    test "sap_system_discovery payload of type application parsing should return the expected commands" do
      assert {:ok,
              [
                %RegisterApplicationInstance{
                  db_host: "10.74.1.12",
                  features: "ABAP|GATEWAY|ICMAN|IGS",
                  host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                  instance_number: "02",
                  sap_system_id: nil,
                  sid: "HA1",
                  tenant: "PRD"
                }
              ]} =
               "sap_system_discovery_application"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end
  end
end
