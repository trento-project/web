defmodule Trento.Settings.AlertingSettingsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Settings.AlertingSettings

  test "returns an error when settings are not available" do
    assert {:error, :alerting_settings_not_configured} == AlertingSettings.get_alerting_settings()
  end

  test "returns previously inserted data correcly on get" do
    inserted_settings = insert(:alerting_settings, [], returning: true)
    {:ok, read_settings} = AlertingSettings.get_alerting_settings()
    assert inserted_settings === read_settings
  end

  for field_name <- [:sender_email, :recipient_email] do
    test "returns error when trying to save with wrong email address for field #{field_name}" do
      settings = build(:alerting_settings, [{unquote(field_name), "not-a-mail-address"}])

      assert {:error,
              %Ecto.Changeset{
                errors: [{unquote(field_name), {"Invalid e-mail address.", _}}]
              }} = AlertingSettings.set_alerting_settings(Map.from_struct(settings))
    end
  end

  test "return error when trying to save with wrong port value" do
    settings = build(:alerting_settings, smtp_port: 70000)

    assert {:error,
            %Ecto.Changeset{
              errors: [smtp_port: {"Invalid port number.", _}]
            }} = AlertingSettings.set_alerting_settings(Map.from_struct(settings))
  end

  test "successfully persists settings when called with correct input" do
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

  test "settings can be overridden" do
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
