defmodule Tronto.Support.Middleware.ValidateTest do
  use ExUnit.Case

  alias Tronto.Support.Middleware.Validate

  alias Commanded.Middleware.Pipeline

  @moduletag :unit

  test "should halt if command is invalid" do
    command = %TestCommand{id: Faker.StarWars.character()}
    pipeline = Validate.before_dispatch(%Pipeline{command: command})

    assert pipeline.halted
  end

  test "should not halt if command is valid" do
    command = %TestCommand{id: Faker.UUID.v4()}
    pipeline = Validate.before_dispatch(%Pipeline{command: command})

    assert not pipeline.halted
  end
end
