defmodule TrentoWeb.V1.UserView do
  use TrentoWeb, :view

  def render("index.json", %{users: users}) do
    render_many(users, __MODULE__, "user.json")
  end

  def render("show.json", %{user: user}) do
    render_one(user, __MODULE__, "user.json")
  end

  def render("user.json", %{user: user}) do
    %{
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      enabled: user.locked_at == nil,
      created_at: user.inserted_at,
      updated_at: user.updated_at
    }
  end
end
