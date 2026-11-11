# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.SettingsJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.Checks.Frequency
  alias Trento.Settings.ChecksFrequencySettings
  alias TrentoWeb.V1.SettingsJSON

  describe "renders smlm.json" do
    test "should render relevant fields" do
      %{url: url, username: username, ca_uploaded_at: ca_uploaded_at} =
        settings = %{
          url: Faker.Internet.url(),
          username: Faker.Internet.user_name(),
          password: Faker.Lorem.word(),
          ca_cert: Faker.Lorem.sentence(),
          ca_uploaded_at: DateTime.utc_now()
        }

      assert %{url: url, username: username, ca_uploaded_at: ca_uploaded_at} ==
               SettingsJSON.smlm(%{settings: settings})
    end
  end

  describe "Alerting Settings template/view" do
    @alerting_allowed_fields ~w(enabled sender_email recipient_email smtp_server smtp_port smtp_username enforced_from_env)a

    test "filters only correct fields" do
      settings = build(:alerting_settings)
      expected = Map.take(settings, @alerting_allowed_fields)

      assert expected ==
               SettingsJSON.alerting_settings(%{alerting_settings: settings})
    end
  end

  describe "Checks frequency settings template/view" do
    test "should render whether the checks run periodically, the frequency and whether it is enforced from env" do
      settings = %ChecksFrequencySettings{
        id: Faker.UUID.v4(),
        type: :checks_frequency_settings,
        enabled: true,
        frequency: %Frequency{value: 6, unit: :hour},
        enforced_from_env: true,
        inserted_at: DateTime.utc_now(),
        updated_at: DateTime.utc_now()
      }

      assert %{enabled: true, frequency: %{value: 6, unit: :hour}, enforced_from_env: true} ==
               SettingsJSON.checks_frequency_settings(%{checks_frequency_settings: settings})
    end

    test "should render a null frequency when the environment disables the checks" do
      settings = %ChecksFrequencySettings{
        enabled: false,
        frequency: nil,
        enforced_from_env: true
      }

      assert %{enabled: false, frequency: nil, enforced_from_env: true} ==
               SettingsJSON.checks_frequency_settings(%{checks_frequency_settings: settings})
    end
  end
end
