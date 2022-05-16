defmodule Trento.TypeTest do
  use ExUnit.Case

  test "should return errors if the paramaters of an embedded field could not be validated" do
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

  test "should raise a RuntimeError  if the paramaters of an embedded field could not be validated" do
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
