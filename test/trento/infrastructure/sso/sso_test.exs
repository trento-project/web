defmodule Trento.Infrastructure.SSO.SSOTest do
  @moduledoc false

  use ExUnit.Case, async: true

  alias Trento.Infrastructure.SSO.SSO

  describe "configuration" do
    test "should return if SSO is enabled" do
      Enum.each(
        [
          %{oidc_enabled: false, oauth2_enabled: false, saml_enabled: false, sso_enabled: false},
          %{oidc_enabled: true, oauth2_enabled: false, saml_enabled: false, sso_enabled: true},
          %{oidc_enabled: false, oauth2_enabled: true, saml_enabled: false, sso_enabled: true},
          %{oidc_enabled: false, oauth2_enabled: false, saml_enabled: true, sso_enabled: true}
        ],
        fn %{
             oidc_enabled: oidc_enabled,
             oauth2_enabled: oauth2_enabled,
             saml_enabled: saml_enabled,
             sso_enabled: sso_enabled
           } ->
          Application.put_env(:trento, :oidc, enabled: oidc_enabled)
          Application.put_env(:trento, :oauth2, enabled: oauth2_enabled)
          Application.put_env(:trento, :saml, enabled: saml_enabled)

          assert SSO.sso_enabled?() == sso_enabled

          Application.put_env(:trento, :oidc, enabled: false)
          Application.put_env(:trento, :oauth2, enabled: false)
          Application.put_env(:trento, :saml, enabled: false)
        end
      )
    end
  end
end
