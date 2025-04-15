defmodule Trento.Support.Helpers.AlertingSettingsHelper do
  @moduledoc """
  Test helper functions for alerting settings.
  """

  import ExUnit.Callbacks

  def nil_alerting_app_env do
    Application.put_env(:trento, :alerting,
      enabled: nil,
      sender: nil,
      recipient: nil
    )

    Application.put_env(:trento, Trento.Mailer,
      relay: nil,
      port: nil,
      username: nil,
      password: nil
    )
  end

  # Setup helpers

  def restore_alerting_app_env(_context) do
    default_alerting_config = Application.get_env(:trento, :alerting)
    default_mailer_config = Application.get_env(:trento, Trento.Mailer)

    on_exit(fn ->
      Application.put_env(:trento, :alerting, default_alerting_config)
      Application.put_env(:trento, Trento.Mailer, default_mailer_config)
    end)
  end
end
