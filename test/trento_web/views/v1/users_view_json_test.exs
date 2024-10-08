defmodule TrentoWeb.V1.UsersJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias TrentoWeb.V1.UsersJSON

  describe "renders user.json" do
    test "should correctly render a user when the user has user identities" do
      identities = build_list(1, :user_identity)
      abilities = build_list(1, :ability)

      %{
        email: email,
        fullname: fullname,
        id: id
      } = user = build(:user, user_identities: identities, abilities: abilities)

      assert %{
               email: ^email,
               enabled: true,
               fullname: ^fullname,
               id: ^id,
               idp_user: true
             } = UsersJSON.user(%{user: user})
    end

    test "should correctly render a user when the user has no user identities" do
      abilities = build_list(1, :ability)

      %{
        email: email,
        fullname: fullname,
        id: id
      } = user = build(:user, abilities: abilities, user_identities: [])

      assert %{
               email: ^email,
               enabled: true,
               fullname: ^fullname,
               id: ^id,
               idp_user: false
             } = UsersJSON.user(%{user: user})
    end
  end
end
