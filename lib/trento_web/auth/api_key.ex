defmodule TrentoWeb.Auth.ApiKey do
  @moduledoc """
  ApiKey is the module responsible for creating a proper jwt api token used for accessing the api token protected resource.
  The token uses the same signer as app access token
  Uses Joken as jwt base library
  """
  use Joken.Config, default_signer: :access_token_signer

  @reasonable_infinite 365 * 100

  @iss Application.compile_env!(:trento, :jwt_authentication)[:issuer]
  @aud Application.compile_env!(:trento, :jwt_authentication)[:api_key_audience]

  @impl true
  def token_config do
    default_claims(iss: @iss, aud: @aud)
  end

  @doc """
    Generates and sign a valid api key with given claims and expiration.
     
    Expiration set to infinite when nil
    Raise an error
  """

  @spec generate_api_key!(map, DateTime.t(), nil) :: String.t()
  def generate_api_key!(claims, created_at, nil) do
    expires_at = DateTime.add(created_at, @reasonable_infinite, :day)

    generate_jwt!(claims, created_at, expires_at)
  end

  @spec generate_api_key!(map, DateTime.t(), DateTime.t()) :: String.t()
  def generate_api_key!(claims, created_at, expires_at) do
    generate_jwt!(claims, created_at, expires_at)
  end

  defp generate_jwt!(claims, created_at, expires_at) do
    claims =
      Map.merge(claims, %{
        "typ" => "Bearer",
        "exp" => DateTime.to_unix(expires_at),
        "iat" => DateTime.to_unix(created_at),
        "nbf" => DateTime.to_unix(created_at)
      })

    generate_and_sign!(claims)
  end
end
