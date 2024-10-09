defmodule TrentoWeb.V1.AbilityJSON do
  def index(%{abilities: abilities}), do: Enum.map(abilities, &ability/1)

  def show(%{ability: ability}), do: ability(ability)

  def ability(%{
        id: id,
        name: name,
        resource: resource,
        label: label
      }),
      do: %{
        id: id,
        name: name,
        resource: resource,
        label: label
      }
end
