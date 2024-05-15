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
          password_change_requested_at: password_change_requested_at,
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
      password_change_requested: password_change_requested_at != nil,
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
