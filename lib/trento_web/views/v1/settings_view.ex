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

  def render("api_key_settings.json", %{
        settings: %{
          api_key_created_at: api_key_created_at,
          api_key_expire_at: api_key_expire_at,
          generated_api_key: generated_api_key
        }
      }) do
    %{
      api_key_created_at: api_key_created_at,
      generated_api_key: generated_api_key,
      api_key_expire_at: api_key_expire_at
    }
  end
end
