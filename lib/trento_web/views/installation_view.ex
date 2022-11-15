defmodule TrentoWeb.InstallationView do
  use TrentoWeb, :view

  def render("api_key.json", %{api_key: api_key}) do
    %{api_key: api_key}
  end
end
