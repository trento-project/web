# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.DatabaseJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  alias TrentoWeb.V1.DatabaseJSON

  describe "DatabaseJSON" do
    test "should render databases.json" do
      database_id = Faker.UUID.v4()
      database_instances = build_list(1, :database_instance, database_id: database_id)

      database =
        build(:database,
          id: database_id,
          tags: [],
          database_instances: database_instances
        )

      expect_health_details = %{
        instances_health: %{value: database.health_details.instances_health.value}
      }

      expect_database_json =
        database
        |> Map.from_struct()
        |> Map.delete(:__meta__)
        |> Map.delete(:deregistered_at)
        |> Map.delete(:sap_systems)
        |> Map.delete(:tenants)
        |> Map.put(:health_details, expect_health_details)
        |> Map.put(
          :database_instances,
          Enum.map(database_instances, fn db_instance ->
            db_instance
            |> Map.from_struct()
            |> Map.delete(:__meta__)
            |> Map.delete(:host)
            |> Map.put(:sap_system_id, database_id)
            |> Map.put(:health, :unknown)
          end)
        )

      assert [expect_database_json] ==
               DatabaseJSON.databases(%{
                 databases: [database]
               })
    end

    test "should render database.json with nil health_details" do
      database_id = Faker.UUID.v4()
      database_instances = build_list(1, :database_instance, database_id: database_id)

      database =
        build(:database,
          id: database_id,
          database_instances: database_instances,
          health_details: nil
        )

      rendered = DatabaseJSON.database(%{database: database})
      assert rendered.health_details == nil
    end

    test "should render database_health_details_changed" do
      id = Faker.UUID.v4()
      health_details_projection = build(:database_health_details_projection)

      data =
        DatabaseJSON.database_health_details_changed(%{
          id: id,
          health_details: health_details_projection
        })

      expected_health_details = %{
        instances_health: %{value: health_details_projection.instances_health.value}
      }

      assert %{id: id, health_details: expected_health_details} == data
    end
  end
end
