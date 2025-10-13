defmodule TrentoWeb.TokensCase do
  @moduledoc """
  Custom tokens used in tests to cover edge cases.
  """
  use ExUnit.CaseTemplate

  alias TrentoWeb.Auth.AccessToken

  alias TrentoWeb.Auth.PersonalAccessToken, as: PAT

  alias Trento.PersonalAccessTokens.PersonalAccessToken
  alias Trento.Users.User

  import Trento.Factory

  using do
    quote do
      alias TrentoWeb.TokensCase
    end
  end

  defmodule UnsupportedAudienceToken do
    @moduledoc false

    use Joken.Config, default_signer: :access_token_signer

    def token_config, do: default_claims(aud: "unsupported_audience")
  end

  defmodule AudiencelessToken do
    @moduledoc false

    use Joken.Config, default_signer: :access_token_signer

    def token_config, do: default_claims(skip: [:aud])
  end

  defmodule JTIlessToken do
    @moduledoc false

    use Joken.Config, default_signer: :access_token_signer

    def token_config, do: default_claims(skip: [:jti])
  end

  @bad_signer Joken.Signer.create("HS256", "some-incompatible-secret")

  def issued_at, do: DateTime.from_unix!(Joken.current_time() - 500)

  def future_timestamp, do: Joken.current_time() + 200
  def future_date, do: DateTime.from_unix!(future_timestamp())

  def past_timestamp, do: Joken.current_time() - 100
  def past_date, do: DateTime.from_unix!(past_timestamp())

  def token(_type, claims \\ default_claims())

  def token(:malformed, _), do: Faker.Lorem.word()

  def token(:unsupported_audience, claims),
    do: UnsupportedAudienceToken.generate_and_sign!(claims)

  def token(:jti_less, claims), do: JTIlessToken.generate_and_sign!(claims)

  def token(:audience_less, claims), do: AudiencelessToken.generate_and_sign!(claims)

  def token(:sub_less_access_token, claims),
    do:
      claims
      |> Map.delete("sub")
      |> AccessToken.generate_access_token!()

  def token(:badly_signed_access_token, claims),
    do: AccessToken.generate_and_sign!(claims, @bad_signer)

  def token(:expired_access_token, claims),
    do:
      claims
      |> Map.put("exp", past_timestamp())
      |> AccessToken.generate_access_token!()

  def token(:user_bound_expired_pat, _) do
    plain_pat = PAT.generate()
    %User{id: user_id} = insert(:user)

    %PersonalAccessToken{} =
      insert(
        :personal_access_token,
        user_id: user_id,
        expires_at: past_date(),
        token: plain_pat
      )

    plain_pat
  end

  def token(:revoked_pat, _), do: PAT.generate()

  def valid_access_token do
    claims = default_claims()
    {AccessToken.generate_access_token!(claims), claims}
  end

  def valid_user_bound_access_token do
    %User{id: user_id} = insert(:user)

    claims = %{
      "sub" => user_id,
      "exp" => future_timestamp()
    }

    {AccessToken.generate_access_token!(claims), claims}
  end

  def valid_pat do
    %User{id: user_id} = insert(:user)

    pat = PAT.generate()

    %PersonalAccessToken{} =
      insert(
        :personal_access_token,
        user_id: user_id,
        token: pat,
        expires_at: Faker.DateTime.forward(2)
      )

    {pat,
     %{
       "sub" => user_id
     }}
  end

  def invalid_tokens do
    [
      token(:malformed),
      token(:unsupported_audience),
      token(:jti_less),
      token(:audience_less),
      token(:sub_less_access_token),
      token(:badly_signed_access_token),
      token(:expired_access_token),
      token(:user_bound_expired_pat),
      token(:revoked_pat)
    ]
  end

  def token_types do
    [
      :malformed,
      :unsupported_audience,
      :jti_less,
      :audience_less,
      :sub_less_access_token,
      :badly_signed_access_token,
      :expired_access_token,
      :user_bound_expired_pat,
      :revoked_pat
    ]
  end

  defp default_claims do
    %{
      "sub" => 1,
      "exp" => future_timestamp()
    }
  end
end
