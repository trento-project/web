defmodule TrentoWeb.V1.AbilityJSONTest do
  use ExUnit.Case

  import Trento.Factory

  alias TrentoWeb.V1.AbilityJSON

  test "should render index.json" do
    abilities =
      2
      |> build_list(:ability)
      |> Enum.map(fn ability -> Map.from_struct(ability) end)

    expected_abilities =
      Enum.map(abilities, fn %{id: id, name: name, resource: resource, label: label} ->
        %{id: id, name: name, resource: resource, label: label}
      end)

    assert expected_abilities == AbilityJSON.index(%{abilities: abilities})
  end

  test "should render show.json" do
    %{id: id, name: name, resource: resource, label: label} =
      ability = :ability |> build() |> Map.from_struct()

    assert %{id: id, name: name, resource: resource, label: label} ==
             AbilityJSON.show(%{ability: ability})
  end
end
