defmodule Trento.SapSystems.Events.SapSystemRolledUpTest do
  use Trento.AggregateCase, aggregate: Trento.SapSystems.SapSystem, async: true

  alias Trento.Databases.Events.DatabaseRolledUp
  alias Trento.SapSystems.Events.SapSystemRolledUp

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
end
