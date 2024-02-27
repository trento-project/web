defmodule TrentoWeb.Auth.ApiToken do
  @moduledoc """
    ApiToken is the module responsible for creating a proper jwt api token used for accessing the api token protected resource.
    The token uses the same signer as app access token
    Uses Joken as jwt base library
  """
  use Joken.Config, default_signer: :access_token_signer

  @iss Application.compile_env!(:trento, :jwt_authentication)[:issuer]
  @aud Application.compile_env!(:trento, :jwt_authentication)[:api_token_audience]

  @impl true
  def token_config do
    default_claims(iss: @iss, aud: @aud)
  end

  @doc """
    Generates and sign a valid api token with given claims and expiration.

    Raise an error
  """
  @spec generate_api_token!(map, DateTime.t()) :: String.t()
  def generate_api_token!(claims, expiration) do
    claims = Map.merge(claims, %{"typ" => "Bearer", "exp" => DateTime.to_unix(expiration)})
    generate_and_sign!(claims)
  end
end
