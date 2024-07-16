defmodule TrentoWeb.V1.SettingsViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View

  alias TrentoWeb.V1.SettingsView

  describe "renders suma_credentials.json" do
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
               render(SettingsView, "suma_credentials.json", %{settings: settings})
    end
  end
end
