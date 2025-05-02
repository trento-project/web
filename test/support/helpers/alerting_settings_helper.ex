defmodule Trento.Support.Helpers.AlertingSettingsHelper do
  @moduledoc """
  Test helper functions for alerting settings.
  """

  import ExUnit.Callbacks

  def nil_alerting_app_env do
    Application.put_env(:trento, :alerting,
      enabled: nil,
      smtp_server: nil,
      smtp_port: nil,
      smtp_username: nil,
      smtp_password: nil,
      sender_email: nil,
      recipient_email: nil
    )
  end

  # Setup helpers

  def restore_alerting_app_env(_context) do
    default_alerting_config = Application.get_env(:trento, :alerting)

    on_exit(fn ->
      Application.put_env(:trento, :alerting, default_alerting_config)
    end)
  end
end
