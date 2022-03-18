defmodule Trento.Integration.Discovery.SapSystemPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Integration.DiscoveryFixturesHelper

  alias Trento.Integration.Discovery.SapSystemPolicy

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  test "should return the expected commands when a sap_system payload of type database is handled" do
    assert {:ok,
            [
              %RegisterDatabaseInstance{
                features: "HDB|HDB_WORKER",
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                instance_number: "00",
                sap_system_id: "97c4127a-29bc-5315-82bd-8f154bee626f",
                sid: "PRD",
                tenant: "PRD",
                health: :passing
              }
            ]} =
             "sap_system_discovery_database"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle()
  end

  test "should return the expected commands when a sap_system payload of type application is handled" do
    assert {:ok,
            [
              %RegisterApplicationInstance{
                db_host: "10.74.1.12",
                features: "ABAP|GATEWAY|ICMAN|IGS",
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                instance_number: "02",
                sap_system_id: nil,
                sid: "HA1",
                tenant: "PRD",
                health: :passing
              }
            ]} =
             "sap_system_discovery_application"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle()
  end
end
