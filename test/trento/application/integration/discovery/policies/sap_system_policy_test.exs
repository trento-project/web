defmodule Trento.Integration.Discovery.SapSystemPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  import Trento.Integration.DiscoveryFixturesHelper

  alias Trento.Integration.Discovery.SapSystemPolicy

  alias Trento.Domain.Commands.{
    DeregisterApplicationInstance,
    DeregisterDatabaseInstance,
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
                system_replication: "Primary",
                system_replication_status: "ERROR",
                health: :passing
              }
            ]} =
             "sap_system_discovery_database"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([])
  end

  test "should return the expected commands when a sap_system payload of type database is handled in the event of a stopped instance" do
    assert {:ok,
            [
              %RegisterDatabaseInstance{
                features: "HDB|HDB_WORKER",
                host_id: "9cd46919-5f19-59aa-993e-cf3736c71053",
                instance_number: "10",
                sap_system_id: "6c9208eb-a5bb-57ef-be5c-6422dedab602",
                sid: "HDP",
                tenant: "HDP",
                system_replication: nil,
                system_replication_status: nil,
                health: :unknown
              }
            ]} =
             "sap_system_discovery_database_stopped_instance"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([])
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
             |> SapSystemPolicy.handle([])
  end

  test "should return the expected commands when a sap_system payload of type application and diagnostics is handled" do
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
             "sap_system_discovery_application_diagnostics"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([])
  end

  test "should return an empty list of commands if an empty payload is received" do
    assert {:ok, []} =
             "sap_system_discovery_empty"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([])
  end

  describe "delta deregistration" do
    test "should deregister the old instances and register the new ones" do
      database_sap_system_id = UUID.uuid4()

      [
        %{instance_number: database_instance_number_1},
        %{instance_number: database_instance_number_2}
      ] =
        database_instances =
        build_list(
          2,
          :database_instance_without_host,
          sap_system_id: database_sap_system_id
        )

      [
        %{instance_number: application_instance_number_1},
        %{instance_number: application_instance_number_2}
      ] =
        application_instances =
        build_list(
          2,
          :application_instance_without_host
        )

      assert {:ok,
              [
                %DeregisterDatabaseInstance{
                  sap_system_id: ^database_sap_system_id,
                  instance_number: ^database_instance_number_1
                },
                %DeregisterDatabaseInstance{
                  sap_system_id: ^database_sap_system_id,
                  instance_number: ^database_instance_number_2
                },
                %DeregisterApplicationInstance{
                  instance_number: ^application_instance_number_1
                },
                %DeregisterApplicationInstance{
                  instance_number: ^application_instance_number_2
                },
                %RegisterDatabaseInstance{
                  instance_number: "00",
                  sap_system_id: "97c4127a-29bc-5315-82bd-8f154bee626f",
                  sid: "PRD"
                }
              ]} =
               "sap_system_discovery_database"
               |> load_discovery_event_fixture()
               |> SapSystemPolicy.handle(database_instances ++ application_instances)
    end

    test "should not deregister any instance if the discovered instances did not change" do
      application_instance =
        build(:application_instance_without_host,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
          instance_number: "02",
          sid: "HA1"
        )

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
               |> SapSystemPolicy.handle([application_instance])
    end

    test "should deregister all instances if the discovered instances is an empty list" do
      application_instance =
        build(:application_instance_without_host,
          instance_number: "02"
        )

      database_instance =
        build(:database_instance_without_host,
          instance_number: "10"
        )

      assert {:ok,
              [
                %DeregisterApplicationInstance{
                  instance_number: "02"
                },
                %DeregisterDatabaseInstance{
                  instance_number: "10"
                }
              ]} =
               "sap_system_discovery_empty"
               |> load_discovery_event_fixture()
               |> SapSystemPolicy.handle([application_instance, database_instance])
    end
  end
end
