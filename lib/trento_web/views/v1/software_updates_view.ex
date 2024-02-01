defmodule TrentoWeb.V1.SoftwareUpdatesView do
  use TrentoWeb, :view

  def render("user_settings.json", %{
        url: url,
        username: username,
        ca_uploaded_at: ca_uploaded_at
      }) do
    %{
      url: url,
      username: username,
      ca_uploaded_at: ca_uploaded_at
    }
  end
end
