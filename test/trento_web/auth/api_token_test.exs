defmodule TrentoWeb.ApiTokenTest do
  @moduledoc false

  alias TrentoWeb.Auth.ApiToken

  use ExUnit.Case

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_timestamp 1_671_641_814

  setup do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      2,
      fn ->
        @test_timestamp
      end
    )

    :ok
  end

  describe "generate_api_token!/2" do
    test "should generate and sign a jwt token with the default claims and expiration correctly set" do
      expected_expiry = @test_timestamp + 400

      expiry_datetime = DateTime.from_unix!(expected_expiry)

      token = ApiToken.generate_api_token!(%{}, expiry_datetime)
      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "iss" => "https://github.com/trento-project/web",
               "aud" => "trento_api_token",
               "exp" => ^expected_expiry,
               "iat" => @test_timestamp,
               "jti" => _,
               "nbf" => @test_timestamp,
               "typ" => "Bearer"
             } = claims
    end

    test "should merge the custom claims with the default after signing" do
      token =
        ApiToken.generate_api_token!(
          %{
            "sub" => 1
          },
          DateTime.from_unix!(@test_timestamp)
        )

      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "sub" => 1
             } = claims
    end
  end
end
