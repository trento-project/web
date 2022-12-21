defmodule TrentoWeb.Auth.RefreshToken do
  @moduledoc """
    Refresh token is the module responsible for creating a proper jwt refresh token

    Uses Joken as jwt base libary
  """
  use Joken.Config, default_signer: :refresh_token_signer

  @impl true
  def token_config do
    default_claims(iss: iss(), aud: aud(), default_exp: exp())
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

  defp iss, do: Application.fetch_env!(:trento, :jwt_authentication)[:issuer]
  defp aud, do: Application.fetch_env!(:trento, :jwt_authentication)[:audience]
  defp exp, do: Application.fetch_env!(:trento, :jwt_authentication)[:refresh_token_expiration]
end
