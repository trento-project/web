defmodule TrentoWeb.Auth.TokensTest do
  @moduledoc false

  use Trento.DataCase, async: true
  use TrentoWeb.TokensCase

  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT
  alias TrentoWeb.Auth.Tokens

  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users.User

  import Mox

  import Trento.Factory

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    stub(Joken.CurrentTime.Mock, :current_time, fn -> 1_671_715_992 end)

    :ok
  end

  describe "token verification" do
    test "should return an error on malformed jwt verification" do
      assert {:error, :token_malformed} =
               :malformed
               |> TokensCase.token()
               |> Tokens.verify_and_validate()
    end

    test "should return an error when the audience in unsupported" do
      assert {:error, :invalid_audience} =
               :unsupported_audience
               |> TokensCase.token()
               |> Tokens.verify_and_validate()
    end

    test "should return an error when the necessary claims are missing" do
      for token <- [
            TokensCase.token(:jti_less),
            TokensCase.token(:audience_less),
            TokensCase.token(:sub_less_access_token)
          ] do
        assert {:error, :invalid_token} = Tokens.verify_and_validate(token)
      end
    end

    test "should return an error when the token signature is invalid" do
      assert {:error, :signature_error} =
               :badly_signed_access_token
               |> TokensCase.token()
               |> Tokens.verify_and_validate()
    end
  end

  describe "access token verification" do
    test "should return an error when access token is expired" do
      assert {:error, [message: "Invalid token", claim: "exp", claim_val: _]} =
               :expired_access_token
               |> TokensCase.token()
               |> Tokens.verify_and_validate()
    end

    test "should succeed on valid access token" do
      expiration = TokensCase.future_timestamp()

      claims = %{
        "sub" => 1,
        "exp" => expiration
      }

      assert {:ok,
              %{
                "sub" => 1,
                "jti" => _jti,
                "exp" => ^expiration,
                "aud" => "trento_app",
                "iss" => _issuer,
                "iat" => _issued_at,
                "nbf" => _not_before
              }} =
               claims
               |> AccessToken.generate_access_token!()
               |> Tokens.verify_and_validate()
    end
  end

  describe "pat verification" do
    test "should return an error when the personal access token is expired" do
      assert {:error, :invalid_pat} =
               :user_bound_expired_pat
               |> TokensCase.token()
               |> Tokens.verify_and_validate()
    end

    test "should return an error on revoked pat validation" do
      assert {:error, :invalid_pat} =
               :revoked_pat
               |> TokensCase.token()
               |> Tokens.verify_and_validate()
    end

    test "should succeed on valid pat" do
      %User{id: user_id} = insert(:user)

      plain_pat = PAT.generate()

      %PersonalAccessToken{} =
        insert(
          :personal_access_token,
          user_id: user_id,
          expires_at: Faker.DateTime.forward(3),
          token: plain_pat
        )

      assert {:ok, %{"sub" => ^user_id}} = Tokens.verify_and_validate(plain_pat)
    end
  end

  describe "token introspection" do
    for type <- TokensCase.token_types() do
      @token_type type

      test "should introspect token #{type} as inactive" do
        assert %{"active" => false} ==
                 @token_type
                 |> TokensCase.token()
                 |> Tokens.introspect()
      end
    end

    test "should introspect an active token" do
      for factory <- [:user, :user_with_abilities] do
        expiration = TokensCase.future_timestamp()

        %User{id: user_id} = insert(factory)

        claims = %{
          "sub" => user_id,
          "exp" => expiration
        }

        assert %{
                 "active" => true,
                 "sub" => ^user_id,
                 "jti" => _jti,
                 "exp" => ^expiration,
                 "aud" => "trento_app",
                 "iss" => _issuer,
                 "iat" => _issued_at,
                 "nbf" => _not_before,
                 "abilities" => access_token_abilities
               } =
                 claims
                 |> AccessToken.generate_access_token!()
                 |> Tokens.introspect()

        plain_pat = PAT.generate()

        %PersonalAccessToken{} =
          insert(
            :personal_access_token,
            user_id: user_id,
            expires_at: Faker.DateTime.forward(3),
            token: plain_pat
          )

        assert %{
                 "active" => true,
                 "sub" => ^user_id,
                 "abilities" => pat_abilities
               } = Tokens.introspect(plain_pat)

        if factory == :user do
          assert [] == access_token_abilities
          assert [] == pat_abilities
        else
          assert access_token_abilities == pat_abilities
          assert Enum.all?(access_token_abilities, &(Map.keys(&1) == ["name", "resource"]))
        end
      end
    end
  end
end
