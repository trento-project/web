defmodule Trento.Databases.Events.DatabaseInstanceRegisteredTest do
  use ExUnit.Case

  alias Trento.Databases.Events.DatabaseInstanceRegistered

  describe "DatabaseInstanceRegistered event upcasting" do
    test "should upcast DatabaseInstanceRegistered event properly from version 1" do
      database_id = Faker.UUID.v4()

      assert %DatabaseInstanceRegistered{
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
               |> DatabaseInstanceRegistered.upcast(%{})
               |> DatabaseInstanceRegistered.new!()
    end
  end
end
