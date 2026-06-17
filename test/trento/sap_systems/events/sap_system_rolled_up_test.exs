# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Events.SapSystemRolledUpTest do
  use Trento.AggregateCase, aggregate: Trento.SapSystems.SapSystem, async: true

  import Trento.Factory

  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.Databases.Events.DatabaseRolledUp
  alias Trento.SapSystems.Events.SapSystemRolledUp
  alias Trento.SapSystems.SapSystem

  alias Trento.Support.StructHelper

  describe "SapSystemRolledUp event superseding" do
    test "should supersede DatabaseRolledUp when the snapshot has legacy data" do
      assert DatabaseRolledUp ==
               SapSystemRolledUp.supersede(%{
                 "snapshot" => %{"database" => %{"health" => :passing}}
               })
    end

    test "should supersede SapSystemRolledUp when the snapshot format is the current one" do
      assert SapSystemRolledUp ==
               SapSystemRolledUp.supersede(%{
                 "snapshot" => %{"health" => :passing}
               })
    end
  end

  describe "SapSystemRolledUp event upcasting" do
    test "should upcast the current snapshot format" do
      sap_system_id = Faker.UUID.v4()
      sid = "PRD"
      health = :passing
      instances = build_list(2, :sap_system_instance, status: Status.green(), stale_at: nil)
      deregistered_at = DateTime.utc_now()

      old_instances =
        Enum.map(instances, fn instance ->
          instance
          |> StructHelper.to_map()
          |> Map.put("health", "passing")
          |> Map.delete("stale_at")
        end)

      assert %SapSystemRolledUp{
               version: 3,
               sap_system_id: sap_system_id,
               snapshot: %SapSystem{
                 sap_system_id: sap_system_id,
                 sid: sid,
                 health: health,
                 instances: instances,
                 deregistered_at: deregistered_at,
                 rolling_up: false
               }
             } ==
               %{
                 "sap_system_id" => sap_system_id,
                 "snapshot" => %{
                   "sap_system_id" => sap_system_id,
                   "sid" => sid,
                   "health" => health,
                   "instances" => old_instances,
                   "deregistered_at" => deregistered_at
                 }
               }
               |> SapSystemRolledUp.upcast(%{})
               |> SapSystemRolledUp.new!()
    end
  end
end
