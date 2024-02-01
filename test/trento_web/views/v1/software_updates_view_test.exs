defmodule TrentoWeb.V1.UserSettingsViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias Trento.SoftwareUpdates.Settings
  alias TrentoWeb.V1.SoftwareUpdatesView

  describe "renders user_settings.json" do
    test "should render all the fields" do
      %Settings{url: url, username: username, ca_uploaded_at: ca_uploaded_at} =
        insert(
          :software_updates_settings,
          [ca_cert: Faker.Lorem.sentence(), ca_uploaded_at: DateTime.utc_now()],
          conflict_target: :id,
          on_conflict: :replace_all
        )

      assert %{url: url, username: username, ca_uploaded_at: ca_uploaded_at} ==
               render(SoftwareUpdatesView, "user_settings.json", %{
                 url: url,
                 username: username,
                 ca_uploaded_at: ca_uploaded_at
               })
    end
  end
end
