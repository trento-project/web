defmodule TrentoWeb.ApiKeyTest do
  @moduledoc false

  alias TrentoWeb.Auth.ApiKey

  use ExUnit.Case

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_timestamp 1_671_641_814

  setup do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      0,
      fn ->
        @test_timestamp
      end
    )

    :ok
  end

  describe "generate_api_key!/2" do
    test "should generate and sign a jwt token with the default claims and expiration correctly set" do
      expected_expiry = @test_timestamp + 400
      expected_creation = @test_timestamp + 100

      expiry_datetime = DateTime.from_unix!(expected_expiry)
      creation_datetime = DateTime.from_unix!(expected_creation)

      token = ApiKey.generate_api_key!(%{}, creation_datetime, expiry_datetime)
      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "iss" => "https://github.com/trento-project/web",
               "aud" => "trento_api_key",
               "exp" => ^expected_expiry,
               "iat" => ^expected_creation,
               "jti" => _,
               "nbf" => ^expected_creation,
               "typ" => "Bearer"
             } = claims
    end

    test "should fallback to a default 'infinite' expiration date, if no expiration is provided" do
      expected_creation = @test_timestamp + 100

      expiry_datetime = DateTime.add(DateTime.from_unix!(expected_creation), 100 * 365, :day)
      expected_expiry = DateTime.to_unix(expiry_datetime)
      creation_datetime = DateTime.from_unix!(expected_creation)

      token = ApiKey.generate_api_key!(%{}, creation_datetime, nil)
      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "iss" => "https://github.com/trento-project/web",
               "aud" => "trento_api_key",
               "exp" => ^expected_expiry,
               "iat" => ^expected_creation,
               "jti" => _,
               "nbf" => ^expected_creation,
               "typ" => "Bearer"
             } = claims
    end

    test "should merge the custom claims with the default after signing" do
      jti = UUID.uuid4()

      token =
        ApiKey.generate_api_key!(
          %{
            "sub" => 1,
            "jti" => jti
          },
          DateTime.from_unix!(@test_timestamp),
          DateTime.from_unix!(@test_timestamp)
        )

      {:ok, claims} = Joken.peek_claims(token)

      assert %{
               "sub" => 1,
               "jti" => ^jti
             } = claims
    end
  end
end
