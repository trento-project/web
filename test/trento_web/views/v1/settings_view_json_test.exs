defmodule TrentoWeb.V1.SettingsJSONTest do
  use TrentoWeb.ConnCase, async: true

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
end
