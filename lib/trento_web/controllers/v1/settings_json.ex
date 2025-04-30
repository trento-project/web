defmodule TrentoWeb.V1.SettingsJSON do
  def settings(%{
        settings: %{
          eula_accepted: eula_accepted
        }
      }),
      do: %{
        eula_accepted: eula_accepted,
        premium_subscription: false
      }

  def api_key_settings(%{
        settings: %{
          created_at: created_at,
          expire_at: expire_at,
          generated_api_key: generated_api_key
        }
      }),
      do: %{
        created_at: created_at,
        generated_api_key: generated_api_key,
        expire_at: expire_at
      }

  def activity_log_settings(%{
        activity_log_settings: %{retention_time: %{value: value, unit: unit}}
      }),
      do: %{
        retention_time: %{
          value: value,
          unit: unit
        }
      }

  def suse_manager(%{
        settings: %{
          url: url,
          username: username,
          ca_uploaded_at: ca_uploaded_at
        }
      }),
      do: %{
        url: url,
        username: username,
        ca_uploaded_at: ca_uploaded_at
      }

  def public_keys(%{public_keys: public_keys}),
    do: Enum.map(public_keys, &public_key(%{public_key: &1}))

  def public_key(%{public_key: %{name: name, certificate_file: cert_file}}),
    do: %{name: name, content: cert_file}

  def alerting_settings(%{
        alerting_settings: %{
          enabled: enabled,
          sender_email: sender_email,
          recipient_email: recipient_email,
          smtp_server: smtp_server,
          smtp_port: smtp_port,
          smtp_username: smtp_username
        }
      }),
      do: %{
        enabled: enabled,
        sender_email: sender_email,
        recipient_email: recipient_email,
        smtp_server: smtp_server,
        smtp_port: smtp_port,
        smtp_username: smtp_username
      }
end
