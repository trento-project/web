defmodule TrentoWeb.V1.UsersView do
  use TrentoWeb, :view

  alias TrentoWeb.V1.AbilityView

  def render("index.json", %{users: users}) do
    render_many(users, __MODULE__, "user.json", as: :user)
  end

  def render("show.json", %{user: user}) do
    render_one(user, __MODULE__, "user.json", as: :user)
  end

  def render("user.json", %{
        user: %{
          id: id,
          fullname: fullname,
          username: username,
          email: email,
          abilities: abilities,
          locked_at: locked_at,
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
      enabled: locked_at == nil,
      password_change_requested_at: password_change_requested_at,
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
