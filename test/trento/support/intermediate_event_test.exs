defmodule Trento.Support.IntermediateEventTest do
  use ExUnit.Case

  alias Commanded.Event.Upcaster
  alias Trento.Support.IntermediateEvent

  test "upcast an event" do
    value = Faker.StarWars.quote()
    term = %{"data" => value}

    assert %TestUpcastedEvent{
             version: 3,
             data: value,
             v2_field: "default string for v2 field",
             v3_field: "default string for v3 field"
           } ==
             Upcaster.upcast(
               %IntermediateEvent{module: TestUpcastedEvent, term: term},
               %{}
             )
  end

  test "upcast a superseeded event" do
    value = Faker.StarWars.quote()
    term = %{"data" => value}

    assert %TestEvent{data: value} ==
             Upcaster.upcast(
               %IntermediateEvent{module: TestLegacyEvent, term: term},
               %{}
             )
  end
end
