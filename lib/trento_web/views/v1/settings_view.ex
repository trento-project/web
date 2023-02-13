defmodule TrentoWeb.V1.SettingsView do
  use TrentoWeb, :view

  def render("settings.json", %{
        settings: %{
          eula_accepted: eula_accepted,
          premium_subscription: premium_subscription
        }
      }) do
    %{
      eula_accepted: eula_accepted,
      premium_subscription: premium_subscription
    }
  end
end
