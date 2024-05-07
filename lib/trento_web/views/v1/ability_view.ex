defmodule TrentoWeb.V1.AbilityView do
  use TrentoWeb, :view

  def render("index.json", %{abilities: abilities}) do
    render_many(abilities, __MODULE__, "ability.json", as: :ability)
  end

  def render("show.json", %{ability: ability}) do
    render_one(ability, __MODULE__, "ability.json", as: :ability)
  end

  def render("ability.json", %{
        ability: %{
          id: id,
          name: name,
          resource: resource,
          label: label
        }
      }) do
    %{
      id: id,
      name: name,
      resource: resource,
      label: label
    }
  end
end
