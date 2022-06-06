defmodule Trento.TypeTest do
  use ExUnit.Case

  describe "build a struct" do
    test "should return errors if the parameters of an embedded field could not be validated" do
      assert {:error, %{embedded: %{id: ["is invalid"]}}} =
               TestData.new(%{
                 id: Faker.UUID.v4(),
                 name: "a",
                 embedded: %{
                   id: 1,
                   name: Faker.StarWars.planet()
                 }
               })
    end

    test "should raise a RuntimeError  if the parameters of an embedded field could not be validated" do
      assert_raise RuntimeError, "%{embedded: %{id: [\"is invalid\"]}}", fn ->
        TestData.new!(%{
          id: Faker.UUID.v4(),
          name: "a",
          embedded: %{
            id: 2,
            name: Faker.StarWars.planet()
          }
        })
      end
    end

    test "should validate the presence of a required embedded field" do
      assert {:error, %{embedded: ["can't be blank"]}} ==
               TestData.new(%{
                 id: Faker.UUID.v4(),
                 name: "a"
               })
    end
  end

  describe "build a list of structs" do
    test "should validate the presence of a required embedded field" do
      assert {:error, [%{embedded: ["can't be blank"]}, %{embedded: ["can't be blank"]}]} ==
               TestData.new([
                 %{id: Faker.UUID.v4(), name: "carbonara"},
                 %{id: Faker.UUID.v4(), name: "amatriciana"}
               ])

      assert {:error, [%{embedded: ["can't be blank"]}, %{embedded: ["can't be blank"]}]} ==
               TestData.new([
                 %{id: Faker.UUID.v4(), name: "carbonara"},
                 %{id: Faker.UUID.v4(), name: "amatriciana"},
                 %{
                   id: Faker.UUID.v4(),
                   name: "cacio_pepe",
                   embedded: %{id: Faker.UUID.v4(), name: "yay"}
                 }
               ])
    end

    test "should return an empty list" do
      assert {:ok, []} == TestData.new([])

      assert [] == TestData.new!([])
    end

    test "should return a list of structs" do
      {
        :ok,
        [
          %TestData{
            embedded: %EmbeddedTestData{id: _id1, name: "yay"},
            id: _id2,
            name: "cacio_pepe"
          },
          %TestData{
            embedded: %EmbeddedTestData{
              id: _id3,
              name: "wow"
            },
            id: _id4,
            name: "lasagne"
          }
        ]
      } =
        TestData.new([
          %{
            id: Faker.UUID.v4(),
            name: "cacio_pepe",
            embedded: %{id: Faker.UUID.v4(), name: "yay"}
          },
          %{
            id: Faker.UUID.v4(),
            name: "lasagne",
            embedded: %{id: Faker.UUID.v4(), name: "wow"}
          }
        ])
    end

    test "should raise a RuntimeError if the parameters of an embedded field could not be validated" do
      assert_raise RuntimeError, "[%{embedded: %{id: [\"is invalid\"]}}]", fn ->
        TestData.new!([
          %{
            id: Faker.UUID.v4(),
            name: "a",
            embedded: %{
              id: 2,
              name: Faker.StarWars.planet()
            }
          }
        ])
      end
    end
  end
end
