defmodule Trento.MonitoringTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Monitoring
  alias Trento.Repo

  alias Trento.{
    DatabaseReadModel,
    SapSystemReadModel,
    SlesSubscriptionReadModel
  }

  @moduletag :integration

  describe "sap_systems" do
    test "should retrieve all the existing sap systems and the related instances" do
      %SapSystemReadModel{
        id: sap_system_id,
        sid: sid,
        tenant: tenant,
        db_host: db_host
      } = sap_system_projection()

      application_instances =
        0..4
        |> Enum.map(fn _ ->
          application_instance_projection(sap_system_id: sap_system_id)
        end)
        |> Enum.sort_by(&{&1.instance_number, &1.host_id})

      database_instances =
        0..4
        |> Enum.map(fn _ ->
          database_instance_projection(sap_system_id: sap_system_id)
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
             ] = Monitoring.get_all_sap_systems()
    end

    test "should retrieve all the existing databases and the related instances" do
      %DatabaseReadModel{
        id: sap_system_id,
        sid: sid
      } = database_projection()

      database_instances =
        0..4
        |> Enum.map(fn _ ->
          database_instance_projection(sap_system_id: sap_system_id)
        end)
        |> Enum.sort_by(& &1.host_id)

      assert [
               %DatabaseReadModel{
                 sid: ^sid,
                 database_instances: ^database_instances
               }
             ] = Monitoring.get_all_databases()
    end
  end

  describe "SLES Subscriptions" do
    test "No SLES4SAP Subscriptions detected" do
      assert 0 = Repo.all(SlesSubscriptionReadModel) |> length
      assert 0 = Monitoring.get_all_sles_subscriptions()
    end

    test "Detects the correct number of SLES4SAP Subscriptions" do
      0..5
      |> Enum.map(fn _ ->
        subscription_projection(identifier: "SLES_SAP")
        subscription_projection(identifier: "sle-module-server-applications")
      end)

      assert 12 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 6 = Monitoring.get_all_sles_subscriptions()
    end
  end
end
