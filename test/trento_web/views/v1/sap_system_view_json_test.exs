defmodule TrentoWeb.V1.SapSystemJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  alias TrentoWeb.V1.SapSystemJSON

  describe "SapSystemJSON" do
    test "should render sap_systems.json" do
      %{id: database_id, sid: database_sid} = database = build(:database)

      database_instances = build_list(1, :database_instance, database_id: database_id)
      application_instances = build_list(1, :application_instance)

      sap_system =
        build(:sap_system,
          database_id: database_id,
          database: database,
          database_instances: database_instances,
          application_instances: application_instances
        )

      expect_sap_system_json =
        sap_system
        |> Map.from_struct()
        |> Map.delete(:__meta__)
        |> Map.delete(:deregistered_at)
        |> Map.delete(:database)
        |> Map.put(:database_sid, database_sid)
        |> Map.put(
          :application_instances,
          Enum.map(application_instances, fn app_instance ->
            app_instance
            |> Map.from_struct()
            |> Map.delete(:__meta__)
            |> Map.delete(:host)
            |> Map.delete(:sap_system)
          end)
        )
        |> Map.put(
          :database_instances,
          Enum.map(database_instances, fn db_instance ->
            db_instance
            |> Map.from_struct()
            |> Map.delete(:__meta__)
            |> Map.delete(:host)
            |> Map.put(:sap_system_id, database_id)
          end)
        )

      assert [expect_sap_system_json] ==
               SapSystemJSON.sap_systems(%{
                 sap_systems: [sap_system]
               })
    end
  end
end
