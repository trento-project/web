defmodule TrentoWeb.V1.ProfileJSONTest do
  use ExUnit.Case

  import Trento.Factory

  alias TrentoWeb.V1.ProfileJSON

  describe "renders profile.json" do
    test "should correctly render a user profile when the user has no analytics preference" do
      user = build(:user, abilities: [], user_identities: [], analytics_enabled_at: nil)

      assert %{
               analytics_enabled: false
             } = ProfileJSON.profile(%{user: user})
    end

    test "should correctly render a user profile when the user has an analytics preference" do
      user =
        build(:user, abilities: [], user_identities: [], analytics_enabled_at: DateTime.utc_now())

      assert %{
               analytics_enabled: true
             } = ProfileJSON.profile(%{user: user})
    end
  end
end
