defmodule Trento.Discovery.Policies.SapSystemPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  import Trento.DiscoveryFixturesHelper

  alias Trento.Discovery.Policies.SapSystemPolicy

  alias Trento.Databases.Commands.{
    MarkDatabaseInstanceAbsent,
    RegisterDatabaseInstance
  }

  alias Trento.Databases.ValueObjects.Tenant

  alias Trento.SapSystems.Commands.{
    MarkApplicationInstanceAbsent,
    RegisterApplicationInstance
  }

  test "should return the expected commands when a sap_system payload of type database is handled with multiple tenants" do
    assert {:ok,
            [
              %RegisterDatabaseInstance{
                features: "HDB|HDB_WORKER",
                host_id: "6a5dc5da-e28b-5b3c-8808-8dc88714720d",
                instance_number: "56",
                database_id: "f2641862-5810-5976-b19f-079fa9f82d9a",
                sid: "HS6",
                tenants: [%Tenant{name: "HS6"}, %Tenant{name: "S4TENANT"}],
                system_replication: nil,
                system_replication_status: nil,
                health: :passing
              }
            ]} =
             "sap_system_discovery_database_multi_tenant"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([], [])
  end

  test "should return the expected commands when a sap_system payload of type database is handled" do
    assert {:ok,
            [
              %RegisterDatabaseInstance{
                features: "HDB|HDB_WORKER",
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                instance_number: "00",
                database_id: "97c4127a-29bc-5315-82bd-8f154bee626f",
                sid: "PRD",
                tenants: [%Tenant{name: "PRD"}],
                system_replication: "Primary",
                system_replication_status: "ERROR",
                health: :passing
              }
            ]} =
             "sap_system_discovery_database"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([], [])
  end

  test "should return the expected commands when a sap_system payload of type database is handled in the event of a stopped instance" do
    assert {:ok,
            [
              %RegisterDatabaseInstance{
                features: "HDB|HDB_WORKER",
                host_id: "9cd46919-5f19-59aa-993e-cf3736c71053",
                instance_number: "10",
                database_id: "6c9208eb-a5bb-57ef-be5c-6422dedab602",
                sid: "HDP",
                tenants: [%Tenant{name: "HDP"}],
                system_replication: nil,
                system_replication_status: nil,
                health: :unknown
              }
            ]} =
             "sap_system_discovery_database_stopped_instance"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([], [])
  end

  test "should return the expected commands when a sap_system payload of type application is handled and the sap instance is part of a cluster" do
    %{id: cluster_id, sap_instances: sap_instances} =
      insert(:cluster,
        sap_instances: build_list(1, :clustered_sap_instance, sid: "HA1", instance_number: "02")
      )

    %{id: host_id} = insert(:host, cluster_id: cluster_id)

    assert {:ok,
            [
              %RegisterApplicationInstance{
                db_host: "10.74.1.12",
                features: "ABAP|GATEWAY|ICMAN|IGS",
                host_id: ^host_id,
                instance_number: "02",
                sap_system_id: nil,
                sid: "HA1",
                tenant: "PRD",
                health: :passing,
                clustered: true,
                ensa_version: EnsaVersion.no_ensa()
              }
            ]} =
             "sap_system_discovery_application"
             |> load_discovery_event_fixture()
             |> Map.put("agent_id", host_id)
             |> SapSystemPolicy.handle([], sap_instances)
  end

  test "should return the expected commands when a sap_system payload of type application is handled and the sap instance is not part of a cluster" do
    %{id: cluster_id, sap_instances: sap_instances} =
      insert(:cluster,
        sap_instances: build_list(1, :clustered_sap_instance, sid: "HA2", instance_number: "01")
      )

    %{id: host_id} = insert(:host, cluster_id: cluster_id)

    assert {:ok,
            [
              %RegisterApplicationInstance{
                db_host: "10.74.1.12",
                features: "ABAP|GATEWAY|ICMAN|IGS",
                host_id: ^host_id,
                instance_number: "02",
                sap_system_id: nil,
                sid: "HA1",
                tenant: "PRD",
                health: :passing,
                clustered: false,
                ensa_version: EnsaVersion.no_ensa()
              }
            ]} =
             "sap_system_discovery_application"
             |> load_discovery_event_fixture()
             |> Map.put("agent_id", host_id)
             |> SapSystemPolicy.handle([], sap_instances)
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
                health: :passing,
                ensa_version: EnsaVersion.no_ensa()
              }
            ]} =
             "sap_system_discovery_application"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([], [])
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
             |> SapSystemPolicy.handle([], [])
  end

  test "should return the expected commands when a sap_system payload of type application and diagnostics is handled and the host is part of a cluster" do
    %{id: cluster_id, sap_instances: sap_instances} =
      insert(:cluster,
        sap_instances: build_list(1, :clustered_sap_instance, sid: "HA1", instance_number: "02")
      )

    %{id: host_id} = insert(:host, cluster_id: cluster_id)

    assert {:ok,
            [
              %RegisterApplicationInstance{
                db_host: "10.74.1.12",
                features: "ABAP|GATEWAY|ICMAN|IGS",
                host_id: ^host_id,
                instance_number: "02",
                sap_system_id: nil,
                sid: "HA1",
                tenant: "PRD",
                health: :passing,
                clustered: true
              }
            ]} =
             "sap_system_discovery_application_diagnostics"
             |> load_discovery_event_fixture()
             |> Map.put("agent_id", host_id)
             |> SapSystemPolicy.handle([], sap_instances)
  end

  test "should return the expected commands when a sap_system payload of type application with ensa version is handled" do
    Enum.each(
      [
        ["enserver", EnsaVersion.ensa1()],
        ["enrepserver", EnsaVersion.ensa1()],
        ["enq_server", EnsaVersion.ensa2()],
        ["enq_replicator", EnsaVersion.ensa2()]
      ],
      fn [process_name, expected_ensa_version] ->
        assert {:ok,
                [
                  %RegisterApplicationInstance{
                    ensa_version: ^expected_ensa_version
                  }
                ]} =
                 "sap_system_discovery_application"
                 |> load_discovery_event_fixture()
                 |> update_in(
                   ["payload"],
                   &Enum.map(&1, fn sap_system ->
                     update_in(
                       sap_system,
                       ["Instances"],
                       fn instances ->
                         Enum.map(instances, fn instance ->
                           put_in(
                             instance,
                             ["SAPControl", "Processes"],
                             [
                               build(:sapcontrol_process),
                               build(:sapcontrol_process, %{"name" => process_name}),
                               build(:sapcontrol_process)
                             ]
                           )
                         end)
                       end
                     )
                   end)
                 )
                 |> SapSystemPolicy.handle([], [])
      end
    )
  end

  test "should return an empty list of commands if an empty payload is received" do
    assert {:ok, []} =
             "sap_system_discovery_empty"
             |> load_discovery_event_fixture()
             |> SapSystemPolicy.handle([], [])
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
          :database_instance,
          database_id: database_sap_system_id
        )

      [
        %{instance_number: application_instance_number_1},
        %{instance_number: application_instance_number_2}
      ] =
        application_instances =
        build_list(
          2,
          :application_instance
        )

      assert {:ok,
              [
                %MarkDatabaseInstanceAbsent{
                  database_id: ^database_sap_system_id,
                  instance_number: ^database_instance_number_1
                },
                %MarkDatabaseInstanceAbsent{
                  database_id: ^database_sap_system_id,
                  instance_number: ^database_instance_number_2
                },
                %MarkApplicationInstanceAbsent{
                  instance_number: ^application_instance_number_1
                },
                %MarkApplicationInstanceAbsent{
                  instance_number: ^application_instance_number_2
                },
                %RegisterDatabaseInstance{
                  instance_number: "00",
                  database_id: "97c4127a-29bc-5315-82bd-8f154bee626f",
                  sid: "PRD"
                }
              ]} =
               "sap_system_discovery_database"
               |> load_discovery_event_fixture()
               |> SapSystemPolicy.handle(database_instances ++ application_instances, [])
    end

    test "should not deregister any instance if the discovered instances did not change" do
      application_instance =
        build(:application_instance,
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
               |> SapSystemPolicy.handle([application_instance], [])
    end

    test "should deregister all instances if the discovered instances is an empty list" do
      application_instance =
        build(:application_instance,
          instance_number: "02"
        )

      database_instance =
        build(:database_instance,
          instance_number: "10"
        )

      assert {:ok,
              [
                %MarkApplicationInstanceAbsent{
                  instance_number: "02"
                },
                %MarkDatabaseInstanceAbsent{
                  instance_number: "10"
                }
              ]} =
               "sap_system_discovery_empty"
               |> load_discovery_event_fixture()
               |> SapSystemPolicy.handle([application_instance, database_instance], [])
    end

    test "should deregister all instances if the discovered instances contains an empty list inside a regular payload" do
      application_instance =
        build(:application_instance,
          instance_number: "02"
        )

      database_instance =
        build(:database_instance,
          instance_number: "10"
        )

      assert {:ok,
              [
                %MarkApplicationInstanceAbsent{
                  instance_number: "02"
                },
                %MarkDatabaseInstanceAbsent{
                  instance_number: "10"
                }
              ]} =
               "sap_system_discovery_empty_application_instances"
               |> load_discovery_event_fixture()
               |> SapSystemPolicy.handle([application_instance, database_instance], [])
    end
  end

  describe "validation" do
    test "should fail if an application instance payload does not have a dbname entry in the profile" do
      assert {:error, {:validation, [%{Profile: %{"dbs/hdb/dbname": ["can't be blank"]}}]}} =
               "sap_system_discovery_application"
               |> load_discovery_event_fixture()
               |> update_in(
                 ["payload"],
                 &Enum.map(&1, fn sap_system ->
                   sap_system |> pop_in(["Profile", "dbs/hdb/dbname"]) |> elem(1)
                 end)
               )
               |> SapSystemPolicy.handle([], nil)
    end
  end
end
