defmodule Trento.Databases.Events.DatabaseInstanceMarkedPresentTest do
  use Trento.AggregateCase, aggregate: Trento.Databases.Database, async: true

  alias Trento.Databases.Events.DatabaseInstanceMarkedPresent

  describe "DatabaseInstanceMarkedPresent event upcasting, version 2" do
    test "should upcast event id when a legacy event is received" do
      database_id = Faker.UUID.v4()

      assert %{"version" => 2, "database_id" => database_id} ==
               DatabaseInstanceMarkedPresent.upcast(
                 %{"sap_system_id" => database_id},
                 %{}
               )
    end

    test "should upcast to the current event" do
      database_id = Faker.UUID.v4()

      assert %{"version" => 2, "database_id" => database_id} ==
               DatabaseInstanceMarkedPresent.upcast(
                 %{"database_id" => database_id},
                 %{}
               )
    end
  end
end
