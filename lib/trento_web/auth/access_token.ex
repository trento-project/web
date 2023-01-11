defmodule TrentoWeb.Auth.AccessToken do
  @moduledoc """
    Jwt Token is the module responsible for creating a proper jwt access token.

    Uses Joken as jwt base library
  """
  use Joken.Config, default_signer: :access_token_signer

  @expires_in Application.compile_env!(:trento, :jwt_authentication)[:access_token_expiration]
  @iss Application.compile_env!(:trento, :jwt_authentication)[:issuer]
  @aud Application.compile_env!(:trento, :jwt_authentication)[:audience]

  @impl true
  def token_config do
    default_claims(iss: @iss, aud: @aud, default_exp: @expires_in)
  end

  @doc """
    Generates and sign a valid access token with the default claims
    for the token type

    Raise an error
  """
  @spec generate_access_token!(map) :: binary
  def generate_access_token!(claims) do
    claims = Map.merge(claims, %{"typ" => "Bearer"})
    generate_and_sign!(claims)
  end

  @doc """
    Returns the access_token expiration time, in seconds
  """
  @spec expires_in :: integer()
  def expires_in, do: @expires_in
end
