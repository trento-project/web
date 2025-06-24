defmodule TrentoWeb.V1.SettingsJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias TrentoWeb.V1.SettingsJSON

  describe "renders suse_manager.json" do
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
               SettingsJSON.suse_manager(%{settings: settings})
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
end
