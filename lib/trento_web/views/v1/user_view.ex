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
      email: user.email
    }
  end
end
