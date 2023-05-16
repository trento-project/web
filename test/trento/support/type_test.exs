defmodule Trento.TypeTest do
  use ExUnit.Case

  describe "build a struct" do
    test "should return errors if the parameters of an embedded and polymorphic fields could not be validated" do
      assert {:error,
              {:validation,
               %{embedded: %{id: ["is invalid"]}, polymorphic: %{id: ["is invalid"]}}}} =
               TestData.new(%{
                 id: Faker.UUID.v4(),
                 name: "a",
                 embedded: %{
                   id: 1,
                   name: Faker.StarWars.planet()
                 },
                 polymorphic: %{
                   id: 2,
                   address: Faker.StarWars.planet()
                 }
               })
    end

    test "should raise a RuntimeError if the parameters of an embedded and polymorphic fields could not be validated" do
      assert_raise RuntimeError,
                   "%{embedded: %{id: [\"is invalid\"]}, polymorphic: %{id: [\"is invalid\"]}}",
                   fn ->
                     TestData.new!(%{
                       id: Faker.UUID.v4(),
                       name: "a",
                       embedded: %{
                         id: 2,
                         name: Faker.StarWars.planet()
                       },
                       polymorphic: %{
                         id: 2,
                         address: Faker.StarWars.planet()
                       }
                     })
                   end
    end

    test "should validate the presence of a required embedded and polymorphic fields" do
      assert {:error,
              {:validation, %{embedded: ["can't be blank"], polymorphic: ["can't be blank"]}}} ==
               TestData.new(%{
                 id: Faker.UUID.v4(),
                 name: "a"
               })
    end
  end

  describe "build a list of structs" do
    test "should validate the presence of a required embedded and polymorphic fields" do
      assert {:error,
              {:validation,
               [
                 %{embedded: ["can't be blank"], polymorphic: ["can't be blank"]},
                 %{embedded: ["can't be blank"], polymorphic: ["can't be blank"]}
               ]}} ==
               TestData.new([
                 %{id: Faker.UUID.v4(), name: "carbonara"},
                 %{id: Faker.UUID.v4(), name: "amatriciana"}
               ])

      assert {:error,
              {:validation,
               [
                 %{embedded: ["can't be blank"], polymorphic: ["can't be blank"]},
                 %{embedded: ["can't be blank"], polymorphic: ["can't be blank"]}
               ]}} ==
               TestData.new([
                 %{id: Faker.UUID.v4(), name: "carbonara"},
                 %{id: Faker.UUID.v4(), name: "amatriciana"},
                 %{
                   id: Faker.UUID.v4(),
                   name: "cacio_pepe",
                   embedded: %{id: Faker.UUID.v4(), name: "yay"},
                   polymorphic: %{id: Faker.UUID.v4(), phone: "123456789"}
                 }
               ])
    end

    test "should return an empty list" do
      assert {:ok, []} == TestData.new([])

      assert [] == TestData.new!([])
    end

    test "should return a list of structs" do
      assert {
               :ok,
               [
                 %TestData{
                   embedded: %EmbeddedTestData{id: _id1, name: "yay"},
                   polymorphic: %PolymorphicPhoneTestData{id: _, phone: "123456789"},
                   id: _id2,
                   name: "cacio_pepe"
                 },
                 %TestData{
                   embedded: %EmbeddedTestData{id: _id3, name: "wow"},
                   polymorphic: %PolymorphicAddressTestData{id: _, address: "rome"},
                   id: _id4,
                   name: "lasagne"
                 }
               ]
             } =
               TestData.new([
                 %{
                   id: Faker.UUID.v4(),
                   name: "cacio_pepe",
                   embedded: %{id: Faker.UUID.v4(), name: "yay"},
                   polymorphic: %{id: Faker.UUID.v4(), phone: "123456789"}
                 },
                 %{
                   id: Faker.UUID.v4(),
                   name: "lasagne",
                   embedded: %{id: Faker.UUID.v4(), name: "wow"},
                   polymorphic: %{id: Faker.UUID.v4(), address: "rome"}
                 }
               ])
    end
  end
end
