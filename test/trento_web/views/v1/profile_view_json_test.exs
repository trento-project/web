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

    test "should correctly render a user profile when the user has not accepted analytics eula" do
      user = build(:user, abilities: [], user_identities: [], analytics_enabled_at: nil)

      assert %{
               analytics_eula_accepted: false
             } = ProfileJSON.profile(%{user: user})
    end

    test "should correctly render a user profile when the user has accepted analytics eula" do
      user =
        build(:user,
          abilities: [],
          user_identities: [],
          analytics_eula_accepted_at: DateTime.utc_now()
        )

      assert %{
               analytics_eula_accepted: true
             } = ProfileJSON.profile(%{user: user})
    end

    test "should render a user profile with PAT list" do
      scenarios = [
        %{
          user: build(:user, abilities: [], user_identities: []),
          expected_pat_count: 0
        },
        %{
          user: build(:user, abilities: [], user_identities: [], personal_access_tokens: []),
          expected_pat_count: 0
        },
        %{
          user:
            build(:user,
              abilities: [],
              user_identities: [],
              personal_access_tokens: build_list(2, :personal_access_token)
            ),
          expected_pat_count: 2
        }
      ]

      for %{user: user, expected_pat_count: expected_pat_count} <- scenarios do
        rendered_user = ProfileJSON.profile(%{user: user})

        assert length(rendered_user.personal_access_tokens) == expected_pat_count
      end
    end
  end
end
