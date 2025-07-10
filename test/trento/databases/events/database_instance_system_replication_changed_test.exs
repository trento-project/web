defmodule Trento.Databases.Events.DatabaseInstanceSystemReplicationChangedTest do
  use ExUnit.Case

  alias Trento.Databases.Events.DatabaseInstanceSystemReplicationChanged

  describe "DatabaseInstanceSystemReplicationChanged event upcasting" do
    test "should upcast DatabaseInstanceSystemReplicationChanged event properly from version 1" do
      database_id = Faker.UUID.v4()

      assert %DatabaseInstanceSystemReplicationChanged{
               version: 3,
               database_id: ^database_id,
               system_replication_site: nil,
               system_replication_mode: nil,
               system_replication_operation_mode: nil,
               system_replication_source_site: nil,
               system_replication_tier: 0
             } =
               %{
                 "database_id" => database_id
               }
               |> DatabaseInstanceSystemReplicationChanged.upcast(%{})
               |> DatabaseInstanceSystemReplicationChanged.new!()
    end
  end
end
