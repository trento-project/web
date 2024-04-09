defmodule Trento.Databases.Events.DatabaseRolledUpTest do
  use Trento.AggregateCase, aggregate: Trento.Databases.Database, async: true

  alias Trento.Databases.Database
  alias Trento.Databases.Events.DatabaseRolledUp

  describe "DatabaseRolledUp event upcasting, version 2" do
    test "should upcast the current snapshot format when the snapshot has legacy data" do
      database_id = Faker.UUID.v4()
      sid = "PRD"
      health = :passing
      instances = []
      deregistered_at = DateTime.utc_now()

      assert %DatabaseRolledUp{
               version: 2,
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
      instances = []
      deregistered_at = DateTime.utc_now()

      assert %DatabaseRolledUp{
               version: 2,
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
                   "instances" => instances,
                   "deregistered_at" => deregistered_at
                 }
               }
               |> DatabaseRolledUp.upcast(%{})
               |> DatabaseRolledUp.new!()
    end
  end
end
