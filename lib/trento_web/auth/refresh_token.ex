defmodule TrentoWeb.Auth.RefreshToken do
  @moduledoc """
    Refresh token is the module responsible for creating a proper jwt refresh token

    Uses Joken as jwt base library
  """
  use Joken.Config, default_signer: :refresh_token_signer

  @iss Application.compile_env!(:trento, :jwt_authentication)[:issuer]
  @aud Application.compile_env!(:trento, :jwt_authentication)[:audience]
  @exp Application.compile_env!(:trento, :jwt_authentication)[:refresh_token_expiration]

  @impl true
  def token_config do
    default_claims(iss: @iss, aud: @aud, default_exp: @exp)
  end

  @doc """
    Generates and sign a valid refresh token with the default claims
    for the token type

    Raise an error
  """
  @spec generate_refresh_token!(map) :: binary
  def generate_refresh_token!(claims) do
    claims = Map.merge(claims, %{"typ" => "Refresh"})
    generate_and_sign!(claims)
  end
end
