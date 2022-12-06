defmodule TrentoWeb.SessionView do
  use TrentoWeb, :view

  def render("logged.json", %{token: token}) do
    %{access_token: token}
  end

  def render("unauthorized.json", _args) do
    %{error: "Invalid email or password"}
  end
end
