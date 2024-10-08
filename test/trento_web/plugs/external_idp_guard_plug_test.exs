defmodule TrentoWeb.Plugs.ExternalIdpGuardPlugTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Plugs.ExternalIdpGuardPlug

  describe "call/2" do
    test "should return 501 when external idp integration is enabled", %{conn: conn} do
      Enum.each(
        [:oidc, :oauth2, :saml],
        fn sso_type ->
          Application.put_env(:trento, sso_type, enabled: true)

          opts = ExternalIdpGuardPlug.init([])
          res = ExternalIdpGuardPlug.call(conn, opts)

          assert res.status == 501
          assert res.halted

          Application.put_env(:trento, sso_type, enabled: false)
        end
      )
    end

    test "should not halt connection when external idp integration is disabled", %{conn: conn} do
      opts = ExternalIdpGuardPlug.init([])
      res = ExternalIdpGuardPlug.call(conn, opts)

      refute res.halted
    end
  end
end
