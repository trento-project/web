defmodule TrentoWeb.PageController do
  use TrentoWeb, :controller

  def index(conn, _params) do
    check_service_base_url = Application.fetch_env!(:trento, :checks_service)[:base_url]
    charts_enabled = Application.fetch_env!(:trento, Trento.Charts)[:enabled]
    deregistration_debounce = Application.fetch_env!(:trento, :deregistration_debounce)
    suse_manager_enabled = Application.fetch_env!(:trento, :suse_manager_enabled)
    admin_username = Application.fetch_env!(:trento, :admin_user)
    oidc_enabled = Application.fetch_env!(:trento, :oidc)[:enabled]

    render(conn, "index.html",
      check_service_base_url: check_service_base_url,
      charts_enabled: charts_enabled,
      deregistration_debounce: deregistration_debounce,
      suse_manager_enabled: suse_manager_enabled,
      admin_username: admin_username,
      oidc_login_url: oidc_login_url(conn, oidc_enabled)
    )
  end

  defp oidc_login_url(conn, true) do
    oidc_trento_origin = Application.fetch_env!(:trento, :oidc)[:trento_origin]

    {:ok, url, _} =
      PowAssent.Plug.authorize_url(conn, :oidc_local, "#{oidc_trento_origin}/auth/oidc_callback")

    url
  end

  defp oidc_login_url(_, _), do: ""
end
