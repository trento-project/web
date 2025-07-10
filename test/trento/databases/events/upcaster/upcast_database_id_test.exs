defmodule Trento.Databases.Event.Upcaster.UpcastDatabaseIdTest do
  use Trento.AggregateCase, aggregate: Trento.Databases.Database, async: true

  alias Trento.Databases.Events

  @upcasted_events [
    Events.DatabaseDeregistered,
    Events.DatabaseHealthChanged,
    Events.DatabaseInstanceDeregistered,
    Events.DatabaseInstanceHealthChanged,
    Events.DatabaseInstanceMarkedAbsent,
    Events.DatabaseInstanceMarkedPresent,
    Events.DatabaseInstanceRegistered,
    Events.DatabaseInstanceSystemReplicationChanged,
    Events.DatabaseRegistered,
    Events.DatabaseRestored
  ]

  describe "UpcastDatabaseId upcasting, version 2" do
    test "should upcast database id field and increase version counter" do
      database_id = Faker.UUID.v4()

      assert %{"version" => 2, "database_id" => ^database_id} =
               Events.DatabaseRegistered.upcast(
                 %{"sap_system_id" => database_id},
                 %{}
               )
    end

    test "should upcast database id field when a legacy event is received" do
      for event <- @upcasted_events do
        database_id = Faker.UUID.v4()

        assert %{"database_id" => ^database_id} =
                 event.upcast(
                   %{"sap_system_id" => database_id},
                   %{}
                 )
      end
    end

    test "should upcast to the current event" do
      for event <- @upcasted_events do
        database_id = Faker.UUID.v4()

        assert %{"database_id" => ^database_id} =
                 event.upcast(
                   %{"database_id" => database_id},
                   %{}
                 )
      end
    end
  end
end
