defmodule TrentoWeb.V1.ProfileView do
  use TrentoWeb, :view

  def render("profile.json", %{
        user: %{
          id: id,
          fullname: fullname,
          username: username,
          email: email,
          inserted_at: created_at,
          updated_at: updated_at
        }
      }) do
    %{
      id: id,
      fullname: fullname,
      username: username,
      email: email,
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
