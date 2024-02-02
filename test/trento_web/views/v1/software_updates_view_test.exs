defmodule TrentoWeb.V1.UserSettingsViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias Trento.SoftwareUpdates.Settings
  alias TrentoWeb.V1.SoftwareUpdatesView

  describe "renders user_settings.json" do
    test "should render relevant fields" do
      %Settings{url: url, username: username, ca_uploaded_at: ca_uploaded_at} =
        build(:software_updates_settings)

      assert %{url: url, username: username, ca_uploaded_at: ca_uploaded_at} ==
               render(SoftwareUpdatesView, "user_settings.json", %{
                 url: url,
                 username: username,
                 ca_uploaded_at: ca_uploaded_at
               })
    end
  end
end
