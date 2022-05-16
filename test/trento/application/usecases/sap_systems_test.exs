defmodule Trento.SapSystemsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.SapSystems

  alias Trento.{
    DatabaseReadModel,
    SapSystemReadModel
  }

  @moduletag :integration

  describe "sap_systems" do
    test "should retrieve all the existing sap systems and the related instances" do
      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid,
        tenant: tenant,
        db_host: db_host
      } = insert(:sap_system)

      application_instances =
        0..4
        |> Enum.map(fn _ ->
          insert(:application_instance_without_host, sap_system_id: sap_system_id)
        end)
        |> Enum.sort_by(&{&1.instance_number, &1.host_id})

      database_instances =
        0..4
        |> Enum.map(fn _ ->
          insert(:database_instance_without_host, sap_system_id: sap_system_id)
        end)
        |> Enum.sort_by(&{&1.instance_number, &1.host_id})

      assert [
               %SapSystemReadModel{
                 id: ^sap_system_id,
                 sid: ^sid,
                 tenant: ^tenant,
                 db_host: ^db_host,
                 application_instances: ^application_instances,
                 database_instances: ^database_instances
               }
             ] = SapSystems.get_all_sap_systems()
    end

    test "should retrieve all the existing databases and the related instances" do
      %DatabaseReadModel{
        id: sap_system_id,
        sid: sid
      } = insert(:database)

      database_instances =
        0..4
        |> Enum.map(fn _ ->
          insert(:database_instance_without_host, sap_system_id: sap_system_id)
        end)
        |> Enum.sort_by(& &1.host_id)

      assert [
               %DatabaseReadModel{
                 sid: ^sid,
                 database_instances: ^database_instances
               }
             ] = SapSystems.get_all_databases()
    end

    test "should add the system replication status to the secondary instance and should remove it from the primary one" do
      %DatabaseReadModel{
        id: sap_system_id
      } = insert(:database)

      insert(
        :database_instance_without_host,
        sap_system_id: sap_system_id,
        system_replication: "Primary",
        system_replication_status: "ACTIVE"
      )

      insert(
        :database_instance_without_host,
        sap_system_id: sap_system_id,
        system_replication: "Secondary",
        system_replication_status: ""
      )

      [%{database_instances: database_instances}] = SapSystems.get_all_databases()

      assert Enum.any?(database_instances, fn
               %{
                 system_replication: "Secondary",
                 system_replication_status: "ACTIVE"
               } ->
                 true

               _ ->
                 false
             end)
    end
  end
end
