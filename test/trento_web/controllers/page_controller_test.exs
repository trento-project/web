# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.PageControllerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false

  alias TrentoWeb.Auth.FakeIdentityProvider

  setup do
    oauth2_config = Application.fetch_env!(:trento, :oauth2)
    pow_assent_config = Application.fetch_env!(:trento, :pow_assent)

    Application.put_env(:trento, :oauth2,
      enabled: true,
      callback_url: "http://localhost:4000/auth/oauth2_callback"
    )

    Application.put_env(:trento, :pow_assent,
      user_identities_context: Trento.UserIdentities,
      providers: [
        oauth2_local: [
          strategy: Assent.Strategy.OAuth2,
          client_id: "trento-web",
          client_secret: "secret",
          base_url: "https://provider.example.com",
          authorize_url: "/oauth/authorize",
          token_url: "/oauth/token"
        ]
      ]
    )

    on_exit(fn ->
      Application.put_env(:trento, :oauth2, oauth2_config)
      Application.put_env(:trento, :pow_assent, pow_assent_config)
    end)
  end

  describe "index" do
    setup do
      Application.put_env(:trento, :checks_service, base_url: "http://localhost:4001")
      Mox.stub(Trento.AI.ApplicationConfigLoader.Mock, :load_config, fn -> [enabled: false] end)

      on_exit(fn -> Application.delete_env(:trento, :checks_service) end)
    end

    test "should point the single sign-on login to the authorize route", %{conn: conn} do
      conn = get(conn, ~p"/")

      assert html_response(conn, 200) =~ "ssoLoginUrl: '/auth/oauth2_local/authorize'"
    end
  end

  describe "sso_authorize" do
    test "should redirect to the identity provider with the configured callback url",
         %{conn: conn} do
      conn = get(conn, ~p"/auth/oauth2_local/authorize")

      assert %URI{host: "provider.example.com", path: "/oauth/authorize", query: query} =
               conn
               |> redirected_to(302)
               |> URI.parse()

      assert %{
               "client_id" => "trento-web",
               "redirect_uri" => "http://localhost:4000/auth/oauth2_callback",
               "state" => _
             } = URI.decode_query(query)
    end

    test "should return bad gateway when the identity provider is unreachable", %{conn: conn} do
      oidc_config = Application.fetch_env!(:trento, :oidc)
      on_exit(fn -> Application.put_env(:trento, :oidc, oidc_config) end)

      Application.put_env(:trento, :oauth2, enabled: false)

      Application.put_env(:trento, :oidc,
        enabled: true,
        callback_url: "http://localhost:4000/auth/oidc_callback"
      )

      Application.put_env(:trento, :pow_assent,
        user_identities_context: Trento.UserIdentities,
        providers: [
          oidc_local: [
            strategy: Assent.Strategy.OIDC,
            client_id: "trento-web",
            client_secret: "secret",
            base_url: "https://unreachable.example.com",
            http_adapter: FakeIdentityProvider
          ]
        ]
      )

      conn = get(conn, ~p"/auth/oidc_local/authorize")

      assert response(conn, 502) =~ "Could not reach the identity provider"
    end

    test "should return not found for a provider that is not enabled", %{conn: conn} do
      conn = get(conn, ~p"/auth/oidc_local/authorize")

      assert response(conn, 404)
    end
  end
end
