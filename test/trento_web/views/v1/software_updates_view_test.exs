defmodule TrentoWeb.V1.SettingsViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias Trento.SoftwareUpdates.Settings
  alias TrentoWeb.V1.SoftwareUpdatesView

  describe "renders software_updates_settings.json" do
    test "should render relevant fields" do
      %Settings{url: url, username: username, ca_uploaded_at: ca_uploaded_at} =
        settings = build(:software_updates_settings)

      assert %{url: ^url, username: ^username, ca_uploaded_at: ^ca_uploaded_at} =
               render(SoftwareUpdatesView, "software_updates_settings.json", %{settings: settings})
    end
  end
end
