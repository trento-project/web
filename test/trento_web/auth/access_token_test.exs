defmodule TrentoWeb.AccessTokenTest do
  @moduledoc false

  alias TrentoWeb.Auth.AccessToken

  use ExUnit.Case

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "generate_access_token!/1" do
    test "should generate and sign a jwt token with the default claims correctly set" do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        3,
        fn ->
          1_671_641_814
        end
      )

      expected_expiry = 1_671_641_814 + 600

      token = AccessToken.generate_access_token!(%{})
      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "iss" => "https://github.com/trento-project/web",
               "aud" => "trento-project",
               "exp" => ^expected_expiry,
               "iat" => 1_671_641_814,
               "jti" => _,
               "nbf" => 1_671_641_814,
               "typ" => "Bearer"
             } = claims
    end

    test "should merge the custom claims with the default after signing" do
      expect(
        Joken.CurrentTime.Mock,
        :current_time,
        3,
        fn ->
          1_671_641_814
        end
      )

      token =
        AccessToken.generate_access_token!(%{
          "sub" => 1
        })

      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "sub" => 1
             } = claims
    end
  end
end
