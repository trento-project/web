defmodule Trento.Application.Auth.JwtToken do
  use Joken.Config

  @impl true
  def token_config do
    default_claims(iss: iss(), aud: aud())
  end

  defp iss, do: Application.fetch_env!(:trento, :jwt_authentication)[:issuer]
  defp aud, do: Application.fetch_env!(:trento, :jwt_authentication)[:audience]
end
