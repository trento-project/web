defmodule TrentoWeb.V1.AbilityJSON do
  def index(%{abilities: abilities}) do
    Enum.map(abilities, &ability/1)
  end

  def show(%{ability: ability}) do
    ability(ability)
  end

  def ability(%{
        id: id,
        name: name,
        resource: resource,
        label: label
      }) do
    %{
      id: id,
      name: name,
      resource: resource,
      label: label
    }
  end
end
