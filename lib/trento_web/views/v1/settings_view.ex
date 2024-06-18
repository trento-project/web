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
          created_at: created_at,
          expire_at: expire_at,
          generated_api_key: generated_api_key
        }
      }) do
    %{
      created_at: created_at,
      generated_api_key: generated_api_key,
      expire_at: expire_at
    }
  end

  def render("activity_log_settings.json", %{
        activity_log_settings: %{retention_time: %{value: value, unit: unit}}
      }) do
    %{
      retention_period: value,
      retention_period_unit: unit
    }
  end
end
