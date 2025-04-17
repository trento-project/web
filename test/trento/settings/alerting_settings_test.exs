defmodule Trento.Settings.AlertingSettingsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Settings.AlertingSettings

  setup_all do
    default_alerting_config = Application.get_env(:trento, :alerting)
    default_mailer_config = Application.get_env(:trento, Trento.Mailer)

    {:ok,
     [
       default_alerting_config: default_alerting_config,
       default_mailer_config: default_mailer_config
     ]}
  end

  setup %{
    default_alerting_config: default_alerting_config,
    default_mailer_config: default_mailer_config
  } do
    on_exit(fn ->
      Application.put_env(:trento, :alerting, default_alerting_config)
      Application.put_env(:trento, Trento.Mailer, default_mailer_config)
    end)
  end

  defp nil_app_env do
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

  describe "`enforced_from_env`" do
    test "returns FALSE if no explicit configuration via env" do
      nil_app_env()
      assert AlertingSettings.enforced_from_env?() == false
    end

    for {key, value, subkey} <- [
          {:enabled, false, :alerting},
          {:sender, "sender@trento.com", :alerting},
          {:recipient, "recipient@trento.com", :alerting},
          {:relay, "test.com", Trento.Mailer},
          {:port, 587, Trento.Mailer},
          {:username, "testuser", Trento.Mailer},
          {:password, "testpass}", Trento.Mailer}
        ] do
      test "returns TRUE if `#{key}` is configured via env" do
        Application.put_env(:trento, unquote(subkey), [{unquote(key), unquote(value)}])
        assert AlertingSettings.enforced_from_env?() == true
      end
    end
  end

  describe "Alerting settings from DB" do
    setup do
      nil_app_env()
      :ok
    end

    test "return correct error on get when they are not configured" do
      assert {:error, :alerting_settings_not_configured} ==
               AlertingSettings.get_alerting_settings()
    end

    test "return previously inserted data correctly on get" do
      inserted_settings = insert(:alerting_settings, [], returning: true)
      {:ok, read_settings} = AlertingSettings.get_alerting_settings()
      assert inserted_settings === read_settings
    end

    for field_name <- [:sender_email, :recipient_email] do
      test "returns error when trying to save with wrong email address for field #{field_name}" do
        nil_app_env()
        settings = build(:alerting_settings, [{unquote(field_name), "not-a-mail-address"}])

        assert {:error,
                %Ecto.Changeset{
                  errors: [{unquote(field_name), {"Invalid e-mail address.", _}}]
                }} = AlertingSettings.set_alerting_settings(Map.from_struct(settings))
      end
    end

    test "return error when trying to save with wrong port value" do
      settings = build(:alerting_settings, smtp_port: 70_000)

      assert {:error,
              %Ecto.Changeset{
                errors: [smtp_port: {"Invalid port number.", _}]
              }} = AlertingSettings.set_alerting_settings(Map.from_struct(settings))
    end

    test "successfully persist when called with correct input" do
      %AlertingSettings{
        sender_email: sender_email,
        recipient_email: recipient_email,
        smtp_server: smtp_server,
        smtp_port: smtp_port,
        smtp_username: smtp_username,
        smtp_password: smtp_password
      } = settings = build(:alerting_settings)

      now = DateTime.utc_now()

      {:ok, saved_settings} = AlertingSettings.set_alerting_settings(Map.from_struct(settings))

      assert saved_settings.id != nil

      assert %AlertingSettings{
               type: :alerting_settings,
               enabled: true,
               sender_email: ^sender_email,
               recipient_email: ^recipient_email,
               smtp_server: ^smtp_server,
               smtp_port: ^smtp_port,
               smtp_username: ^smtp_username,
               smtp_password: ^smtp_password
             } = saved_settings

      assert saved_settings.inserted_at > now
      assert saved_settings.inserted_at == saved_settings.updated_at
    end

    test "can be overridden" do
      %AlertingSettings{
        sender_email: sender_email,
        recipient_email: recipient_email,
        smtp_server: smtp_server,
        smtp_username: smtp_username,
        smtp_password: smtp_password
      } = settings = build(:alerting_settings, smtp_port: 1000)

      {:ok, %AlertingSettings{id: pk, inserted_at: inserted_at_orig, updated_at: updated_at_orig}} =
        AlertingSettings.set_alerting_settings(Map.from_struct(settings))

      settings_modified = %{settings | smtp_port: 1001}

      {status, res_struct} =
        AlertingSettings.set_alerting_settings(Map.from_struct(settings_modified))

      assert status == :ok

      assert %AlertingSettings{
               type: :alerting_settings,
               id: ^pk,
               enabled: true,
               sender_email: ^sender_email,
               recipient_email: ^recipient_email,
               smtp_server: ^smtp_server,
               smtp_port: 1001,
               smtp_username: ^smtp_username,
               smtp_password: ^smtp_password,
               inserted_at: inserted_at_new,
               updated_at: updated_at_new
             } = res_struct

      assert inserted_at_new == inserted_at_orig
      assert updated_at_new > updated_at_orig
    end
  end
end
