defmodule Trento.EventTest do
  use ExUnit.Case

  describe "upcast an event" do
    test "from v1 to v3" do
      assert %TestUpcastedEvent{
               version: 3,
               data: "default data",
               v2_field: "default string for v2 field",
               v3_field: "default string for v3 field"
             } == TestUpcastedEvent.new!(%{data: "default data"})
    end
  end
end
