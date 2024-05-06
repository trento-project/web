defmodule TrentoWeb.V1.ProfileView do
  use TrentoWeb, :view

  alias TrentoWeb.V1.AbilityView

  def render("profile.json", %{
        user: %{
          id: id,
          fullname: fullname,
          username: username,
          email: email,
          abilities: abilities,
          inserted_at: created_at,
          updated_at: updated_at
        }
      }) do
    %{
      id: id,
      fullname: fullname,
      username: username,
      email: email,
      abilities: render_many(abilities, AbilityView, "ability.json", as: :ability),
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
