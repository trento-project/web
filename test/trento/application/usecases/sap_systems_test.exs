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
  end
end
