# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.DatabaseRolledUpTest do
  use Trento.AggregateCase, aggregate: Trento.Databases.Database, async: true

  import Trento.Factory

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Database
  alias Trento.Databases.Events.DatabaseRolledUp

  alias Trento.Support.StructHelper

  describe "DatabaseRolledUp event upcasting" do
    test "should upcast the current snapshot format when the snapshot has legacy data" do
      database_id = Faker.UUID.v4()
      sid = "PRD"
      health = :passing
      instances = []
      deregistered_at = DateTime.utc_now()

      assert %DatabaseRolledUp{
               version: 3,
               database_id: database_id,
               snapshot: %Database{
                 database_id: database_id,
                 sid: sid,
                 health: health,
                 instances: instances,
                 deregistered_at: deregistered_at,
                 rolling_up: false
               }
             } ==
               %{
                 "sap_system_id" => database_id,
                 "snapshot" => %{
                   "sap_system_id" => database_id,
                   "database" => %{
                     "sid" => sid,
                     "health" => health,
                     "instances" => instances,
                     "deregistered_at" => deregistered_at
                   }
                 }
               }
               |> DatabaseRolledUp.upcast(%{})
               |> DatabaseRolledUp.new!()
    end

    test "should upcast the current snapshot format" do
      database_id = Faker.UUID.v4()
      sid = "PRD"
      health = :passing
      instances = build_list(2, :sap_system_instance, status: Status.green())
      deregistered_at = DateTime.utc_now()

      old_instances =
        Enum.map(instances, fn instance ->
          instance
          |> StructHelper.to_map()
          |> Map.put("health", "passing")
          |> Map.delete("stale_at")
        end)

      assert %DatabaseRolledUp{
               version: 3,
               database_id: database_id,
               snapshot: %Database{
                 database_id: database_id,
                 sid: sid,
                 health: health,
                 instances: instances,
                 deregistered_at: deregistered_at,
                 rolling_up: false
               }
             } ==
               %{
                 "database_id" => database_id,
                 "snapshot" => %{
                   "database_id" => database_id,
                   "sid" => sid,
                   "health" => health,
                   "instances" => old_instances,
                   "deregistered_at" => deregistered_at
                 }
               }
               |> DatabaseRolledUp.upcast(%{})
               |> DatabaseRolledUp.new!()
    end
  end
end
