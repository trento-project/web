defmodule TrentoWeb.Auth.PersonalAccessTokenTest do
  @moduledoc false

  alias TrentoWeb.Auth.PersonalAccessToken

  use ExUnit.Case

  import Mox

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_timestamp 1_671_641_814

  setup do
    expect(Joken.CurrentTime.Mock, :current_time, 0, fn -> @test_timestamp end)

    :ok
  end

  describe "personal access token generation" do
    scenarios = [:with_expiration, :without_expiration]

    for scenario <- scenarios do
      @scenario scenario

      test "should generate a PAT #{scenario}" do
        sub = Faker.Random.Elixir.random_between(1, 100)
        jti = Faker.UUID.v4()

        expected_creation = @test_timestamp + 100

        expected_expiry =
          case @scenario do
            :with_expiration ->
              @test_timestamp + 400

            :without_expiration ->
              expected_creation
              |> DateTime.from_unix!()
              |> DateTime.add(100 * 365, :day)
              |> DateTime.to_unix()
          end

        expiry_datetime = DateTime.from_unix!(expected_expiry)
        creation_datetime = DateTime.from_unix!(expected_creation)

        input_claims = %{
          "sub" => sub,
          "jti" => jti
        }

        token = PersonalAccessToken.generate!(input_claims, creation_datetime, expiry_datetime)

        {:ok, claims} = Joken.peek_claims(token)

        assert %{
                 "iss" => "https://github.com/trento-project/web",
                 "aud" => "trento_pat",
                 "sub" => ^sub,
                 "jti" => ^jti,
                 "exp" => ^expected_expiry,
                 "iat" => ^expected_creation,
                 "nbf" => ^expected_creation,
                 "typ" => "Bearer"
               } = claims
      end
    end
  end
end
