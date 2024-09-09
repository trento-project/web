defmodule TrentoWeb.PageController do
  use TrentoWeb, :controller

  def index(conn, _params) do
    check_service_base_url = Application.fetch_env!(:trento, :checks_service)[:base_url]
    charts_enabled = Application.fetch_env!(:trento, Trento.Charts)[:enabled]
    deregistration_debounce = Application.fetch_env!(:trento, :deregistration_debounce)
    suse_manager_enabled = Application.fetch_env!(:trento, :suse_manager_enabled)
    admin_username = Application.fetch_env!(:trento, :admin_user)

    {sso_enabled, callback_url, login_url, enrollment_url} = sso_details(conn)

    render(conn, "index.html",
      check_service_base_url: check_service_base_url,
      charts_enabled: charts_enabled,
      deregistration_debounce: deregistration_debounce,
      suse_manager_enabled: suse_manager_enabled,
      admin_username: admin_username,
      sso_enabled: sso_enabled,
      sso_login_url: login_url,
      sso_callback_url: callback_url,
      sso_enrollment_url: enrollment_url
    )
  end

  defp sso_details(conn) do
    sso_provider =
      cond do
        Application.fetch_env!(:trento, :oidc)[:enabled] ->
          :oidc

        Application.fetch_env!(:trento, :oauth2)[:enabled] ->
          :oauth2

        true ->
          nil
      end

    sso_details_for_provider(conn, sso_provider)
  end

  defp sso_details_for_provider(_conn, nil), do: {false, "", "", ""}

  defp sso_details_for_provider(conn, provider) do
    full_callback_url = Application.fetch_env!(:trento, provider)[:callback_url]
    enrollment_provider = "#{provider}_local"

    %URI{path: callback_url} =
      URI.parse(full_callback_url)

    {:ok, login_url, _} =
      PowAssent.Plug.authorize_url(conn, enrollment_provider, full_callback_url)

    enrollment_url = ~p"/api/session/#{enrollment_provider}/callback"

    {true, callback_url, login_url, enrollment_url}
  end
end
