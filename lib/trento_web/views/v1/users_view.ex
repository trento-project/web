defmodule TrentoWeb.V1.UsersView do
  use TrentoWeb, :view

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
          locked_at: locked_at,
          inserted_at: created_at,
          updated_at: updated_at
        }
      }) do
    %{
      id: id,
      fullname: fullname,
      username: username,
      email: email,
      enabled: locked_at == nil,
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
