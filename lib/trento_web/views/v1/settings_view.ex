defmodule TrentoWeb.V1.SettingsView do
  use TrentoWeb, :view

  def render("settings.json", %{
        settings: %{
          eula_accepted: eula_accepted
        }
      }) do
    %{
      eula_accepted: eula_accepted
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

  def render(
        "activity_log_settings.json",
        %{activity_log_settings: %{retention_time: %{value: value, unit: unit}}}
      ) do
    %{
      retention_time: %{
        value: value,
        unit: unit
      }
    }
  end

  def render("suse_manager.json", %{
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

  def render("public_keys.json", %{public_keys: public_keys}) do
    render_many(public_keys, __MODULE__, "public_key.json", as: :public_key)
  end

  def render("public_key.json", %{public_key: %{name: name, certificate_file: cert_file}}) do
    %{name: name, content: cert_file}
  end
end
