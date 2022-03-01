defmodule Tronto.Support.UUIDValidatorTest do
  use ExUnit.Case

  alias Tronto.Support.UUIDValidator

  @moduletag :unit

  test "should validate a valid UUID" do
    assert :ok =
             UUIDValidator.validate(
               Faker.UUID.v4(),
               nil
             )
  end

  test "should not validate an invalid UUID" do
    assert {:error, _} =
             UUIDValidator.validate(
               Faker.StarWars.character(),
               nil
             )
  end

  test "should not validate md5 string" do
    assert {:error, _} =
             UUIDValidator.validate(
               :crypto.hash(:md5, Faker.StarWars.character()) |> Base.encode16(case: :lower),
               nil
             )
  end
end
