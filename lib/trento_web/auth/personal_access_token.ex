defmodule TrentoWeb.Auth.PersonalAccessToken do
  @moduledoc """
  PersonalAccessToken represents a users' generated token.
  """
  use Joken.Config, default_signer: :access_token_signer

  alias TrentoWeb.Auth.ApiKey

  @iss Application.compile_env!(:trento, :jwt_authentication)[:issuer]

  @aud "trento_pat"

  @spec aud :: String.t()
  def aud, do: @aud

  @impl Joken.Config
  def token_config, do: default_claims(iss: @iss, aud: @aud)

  def generate!(claims, created_at, expires_at) do
    claims
    |> ApiKey.prepare_claims(created_at, expires_at)
    |> generate_and_sign!()
  end
end
