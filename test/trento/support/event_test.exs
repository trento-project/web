defmodule Trento.Support.EventTest do
  use ExUnit.Case

  describe "upcast an event" do
    test "from v1 to v3" do
      data = Faker.StarWars.quote()

      assert %TestUpcastedEvent{
               version: 3,
               data: data,
               v2_field: "default string for v2 field",
               v3_field: "default string for v3 field"
             } ==
               %{"data" => data}
               |> TestUpcastedEvent.upcast(%{})
               |> TestUpcastedEvent.new!()
    end

    test "from v2 to v3" do
      data = Faker.StarWars.quote()
      v2_field = Faker.StarWars.quote()

      assert %TestUpcastedEvent{
               version: 3,
               data: data,
               v2_field: v2_field,
               v3_field: "default string for v3 field"
             } ==
               %{
                 "version" => 2,
                 "data" => data,
                 "v2_field" => v2_field
               }
               |> TestUpcastedEvent.upcast(%{})
               |> TestUpcastedEvent.new!()
    end

    test "from v3 to v3" do
      data = Faker.StarWars.quote()
      v2_field = Faker.StarWars.quote()
      v3_field = Faker.StarWars.quote()

      assert %TestUpcastedEvent{
               version: 3,
               data: data,
               v2_field: v2_field,
               v3_field: v3_field
             } ==
               %{
                 "version" => 3,
                 "data" => data,
                 "v2_field" => v2_field,
                 "v3_field" => v3_field
               }
               |> TestUpcastedEvent.upcast(%{})
               |> TestUpcastedEvent.new!()
    end

    test "new!/1 returns the latest version of the event" do
      data = Faker.StarWars.quote()
      v2_field = Faker.StarWars.quote()
      v3_field = Faker.StarWars.quote()

      assert %TestUpcastedEvent{
               version: 3,
               data: data,
               v2_field: v2_field,
               v3_field: v3_field
             } ==
               TestUpcastedEvent.new!(%{
                 "data" => data,
                 "v2_field" => v2_field,
                 "v3_field" => v3_field
               })
    end
  end

  describe "supersede an event" do
    test "event is superseded" do
      assert TestEvent == TestLegacyEventV2.supersede(nil)
    end

    test "event is not superseded multiple times" do
      assert TestEvent == TestLegacyEventV1.supersede(nil)
    end

    test "event is not superseded" do
      assert TestEvent == TestEvent.supersede(nil)
    end

    test "a superseded event is marked as legacy" do
      assert true == TestLegacyEventV1.legacy?()
      assert true == TestLegacyEventV2.legacy?()
    end

    test "a non-superseded event is not marked as legacy" do
      refute function_exported?(TestEvent, :legacy?, 0)
    end
  end
end
