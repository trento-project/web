defmodule TrentoWeb.V1.SoftwareUpdatesView do
  use TrentoWeb, :view

  def render("software_updates_settings.json", %{
        settings: %{
          url: url,
          username: username,
          ca_uploaded_at: ca_uploaded_at
        }
      }) do
    %{
      url: url,
      username: username,
      ca_uploaded_at: ca_uploaded_at
    }
  end
end
