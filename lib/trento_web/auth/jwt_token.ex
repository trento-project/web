defmodule TrentoWeb.Auth.JwtToken do
  @moduledoc """
    Jwt Token is the module responsible for creating a proper jwt token.

    Uses Joken as jwt base libary
  """
  use Joken.Config

  @impl true
  def token_config do
    default_claims(iss: iss(), aud: aud())
  end

  defp iss, do: Application.fetch_env!(:trento, :jwt_authentication)[:issuer]
  defp aud, do: Application.fetch_env!(:trento, :jwt_authentication)[:audience]
end
