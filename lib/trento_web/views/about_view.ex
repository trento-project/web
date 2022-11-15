defmodule TrentoWeb.AboutView do
  use TrentoWeb, :view

  def render("about.json", %{about_info: about}), do: about
end
