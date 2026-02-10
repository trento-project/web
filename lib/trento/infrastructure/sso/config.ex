defmodule Trento.Infrastructure.SSO.Config do
  @moduledoc """
  Provides a set of functions related to SSO configuration.
  """

  @spec sso_enabled?() :: boolean()
  def sso_enabled?, do: oidc_enabled?() or oauth2_enabled?() or saml_enabled?()

  defp oidc_enabled?, do: Application.fetch_env!(:trento, :oidc)[:enabled]
  defp oauth2_enabled?, do: Application.fetch_env!(:trento, :oauth2)[:enabled]
  defp saml_enabled?, do: Application.fetch_env!(:trento, :saml)[:enabled]
end
