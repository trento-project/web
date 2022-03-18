defmodule Trento.Domain.Commands.UpdateProviderTest do
  use ExUnit.Case

  alias Trento.Domain.Commands.UpdateProvider

  @moduletag :unit

  test "should not validate if host_id is not a valid uuid" do
    command =
      UpdateProvider.new!(%{
        host_id: Faker.StarWars.character(),
        provider: :azure
      })

    assert not Vex.valid?(command)
  end
end
