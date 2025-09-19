defmodule TrentoWeb.Auth.TokensTest do
  @moduledoc false

  use Trento.DataCase

  alias TrentoWeb.Auth.AccessToken
  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT
  alias TrentoWeb.Auth.Tokens

  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users.User

  import Mox

  import Trento.Factory

  @test_timestamp 1_671_715_992

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    stub(Joken.CurrentTime.Mock, :current_time, fn -> @test_timestamp end)

    :ok
  end

  describe "token verification" do
    test "should return an error on invalid token verification" do
      assert {:error, :token_malformed} = Tokens.verify_and_validate("some_invalid_jwt")
    end

    test "should return an error when the audience in unsupported" do
      assert {:error, :invalid_audience} =
               %{
                 "sub" => 1,
                 "exp" => @test_timestamp + 100
               }
               |> UnsupportedAudienceToken.generate_and_sign!()
               |> Tokens.verify_and_validate()
    end

    test "should return an error when the necessary claims are missing" do
      claims = %{
        "sub" => 1,
        "exp" => @test_timestamp + 100
      }

      subless_claims = Map.delete(claims, "sub")

      for token <- [
            JTIlessToken.generate_and_sign!(claims),
            AudiencelessToken.generate_and_sign!(claims),
            AccessToken.generate_and_sign!(subless_claims),
            PAT.generate_and_sign!(subless_claims)
          ] do
        assert {:error, :invalid_token} = Tokens.verify_and_validate(token)
      end
    end

    test "should return an error when the token signature is invalid" do
      invalid_signer = Joken.Signer.create("HS256", "some-incompatible-secret")

      for token_generator <- [&AccessToken.generate_and_sign!/2, &PAT.generate_and_sign!/2] do
        assert {:error, :signature_error} =
                 %{
                   "sub" => 1,
                   "exp" => @test_timestamp + 100
                 }
                 |> token_generator.(invalid_signer)
                 |> Tokens.verify_and_validate()
      end
    end
  end

  describe "access token verification" do
    test "should return an error when access token is expired" do
      assert {:error, [message: "Invalid token", claim: "exp", claim_val: _]} =
               %{
                 "sub" => 1,
                 "exp" => @test_timestamp - 100
               }
               |> AccessToken.generate_and_sign!()
               |> Tokens.verify_and_validate()
    end

    test "should successfully verify a valid access token" do
      expiration = @test_timestamp + 100

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
               |> AccessToken.generate_and_sign!()
               |> Tokens.verify_and_validate()
    end
  end

  describe "pat verification" do
    test "should return an error when the personal access token is expired" do
      assert {:error, [message: "Invalid token", claim: "exp", claim_val: _]} =
               %{
                 "sub" => 1,
                 "exp" => @test_timestamp - 100
               }
               |> PAT.generate_and_sign!()
               |> Tokens.verify_and_validate()
    end

    test "should return an error when pat validation fails" do
      assert {:error, :invalid_pat} =
               %{
                 "sub" => 1,
                 "jti" => Faker.UUID.v4(),
                 "exp" => @test_timestamp + 100
               }
               |> PAT.generate_and_sign!()
               |> Tokens.verify_and_validate()
    end

    test "should successfully verify a valid pat" do
      expiration = @test_timestamp + 100

      %User{id: user_id} = insert(:user)

      %PersonalAccessToken{jti: pat_jti} =
        insert(
          :personal_access_token,
          user_id: user_id,
          expires_at: DateTime.from_unix!(expiration)
        )

      claims = %{
        "jti" => pat_jti,
        "sub" => user_id,
        "exp" => expiration
      }

      assert {:ok,
              %{
                "sub" => ^user_id,
                "jti" => ^pat_jti,
                "exp" => ^expiration,
                "aud" => "trento_pat",
                "iss" => _issuer,
                "iat" => _issued_at,
                "nbf" => _not_before
              }} =
               claims
               |> PAT.generate_and_sign!()
               |> Tokens.verify_and_validate()
    end
  end

  describe "token introspection" do
    test "should introspect an inactive token" do
      invalid_jwt = Faker.Lorem.word()

      claims = %{
        "sub" => 1,
        "exp" => @test_timestamp + 100
      }

      unsupported_audience_token = UnsupportedAudienceToken.generate_and_sign!(claims)
      jtiless_token = JTIlessToken.generate_and_sign!(claims)
      audienceless_token = AudiencelessToken.generate_and_sign!(claims)

      subless_claims = Map.delete(claims, "sub")
      subless_access_token = AccessToken.generate_and_sign!(subless_claims)
      subless_pat = PAT.generate_and_sign!(subless_claims)

      invalid_signer = Joken.Signer.create("HS256", "some-incompatible-secret")
      badly_signed_access_token = AccessToken.generate_and_sign!(claims, invalid_signer)
      badly_signed_pat = PAT.generate_and_sign!(claims, invalid_signer)

      expired_token_claims = Map.replace!(claims, "exp", @test_timestamp - 100)
      expired_access_token = AccessToken.generate_and_sign!(expired_token_claims)
      expired_pat = PAT.generate_and_sign!(expired_token_claims)

      revoked_pat_claims = Map.put(claims, "jti", Faker.UUID.v4())
      revoked_pat = PAT.generate_and_sign!(revoked_pat_claims)

      for token <- [
            invalid_jwt,
            unsupported_audience_token,
            jtiless_token,
            audienceless_token,
            subless_access_token,
            subless_pat,
            badly_signed_access_token,
            badly_signed_pat,
            expired_access_token,
            expired_pat,
            revoked_pat
          ] do
        assert %{"active" => false} == Tokens.introspect(token)
      end
    end

    test "should introspect an active token" do
      for factory <- [:user, :user_with_abilities] do
        %User{id: user_id} = insert(factory)
        %PersonalAccessToken{jti: pat_jti} = insert(:personal_access_token, user_id: user_id)

        expiration = @test_timestamp + 100

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
                 |> AccessToken.generate_and_sign!()
                 |> Tokens.introspect()

        assert %{
                 "active" => true,
                 "sub" => ^user_id,
                 "jti" => ^pat_jti,
                 "exp" => ^expiration,
                 "aud" => "trento_pat",
                 "iss" => _issuer,
                 "iat" => _issued_at,
                 "nbf" => _not_before,
                 "abilities" => pat_abilities
               } =
                 claims
                 |> Map.put("jti", pat_jti)
                 |> PAT.generate_and_sign!()
                 |> Tokens.introspect()

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

defmodule UnsupportedAudienceToken do
  use Joken.Config, default_signer: :access_token_signer

  def token_config, do: default_claims(aud: "unsupported_audience")
end

defmodule AudiencelessToken do
  use Joken.Config, default_signer: :access_token_signer

  def token_config, do: default_claims(skip: [:aud])
end

defmodule JTIlessToken do
  use Joken.Config, default_signer: :access_token_signer

  def token_config, do: default_claims(skip: [:jti])
end
