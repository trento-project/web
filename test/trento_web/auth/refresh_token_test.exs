defmodule TrentoWeb.RefreshTokenTest do
  @moduledoc false

  alias TrentoWeb.Auth.RefreshToken

  use ExUnit.Case

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_timestamp 1_671_641_814
  setup do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      3,
      fn ->
        @test_timestamp
      end
    )

    :ok
  end

  describe "generate_refresh_token!/1" do
    test "it should return a refresh token with the correct default claims" do
      expected_expiry = @test_timestamp + 21_600

      token = RefreshToken.generate_refresh_token!(%{})
      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "iss" => "https://github.com/trento-project/web",
               "aud" => "trento-project",
               "exp" => ^expected_expiry,
               "iat" => @test_timestamp,
               "jti" => _,
               "nbf" => @test_timestamp,
               "typ" => "Refresh"
             } = claims
    end

    test "it should add custom claims to the refresh token" do
      token =
        RefreshToken.generate_refresh_token!(%{
          "sub" => 1,
          "asd" => "test"
        })

      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "sub" => 1,
               "asd" => "test"
             } = claims
    end
  end
end
