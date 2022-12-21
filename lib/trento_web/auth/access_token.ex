defmodule TrentoWeb.Auth.AccessToken do
  @moduledoc """
    Jwt Token is the module responsible for creating a proper jwt access token.

    Uses Joken as jwt base libary
  """
  use Joken.Config

  @impl true
  def token_config do
    default_claims(iss: iss(), aud: aud(), default_exp: exp())
  end

  defp iss, do: Application.fetch_env!(:trento, :jwt_authentication)[:issuer]
  defp aud, do: Application.fetch_env!(:trento, :jwt_authentication)[:audience]
  defp exp, do: Application.fetch_env!(:trento, :jwt_authentication)[:access_token_expiration]
end
