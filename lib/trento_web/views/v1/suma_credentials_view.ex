defmodule TrentoWeb.V1.SUMACredentialsView do
  use TrentoWeb, :view

  def render("suma_credentials.json", %{
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
