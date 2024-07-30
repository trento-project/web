defmodule TrentoWeb.PageController do
  use TrentoWeb, :controller

  def index(conn, _params) do
    check_service_base_url = Application.fetch_env!(:trento, :checks_service)[:base_url]
    charts_enabled = Application.fetch_env!(:trento, Trento.Charts)[:enabled]
    deregistration_debounce = Application.fetch_env!(:trento, :deregistration_debounce)
    suse_manager_enabled = Application.fetch_env!(:trento, :suse_manager_enabled)
    admin_username = Application.fetch_env!(:trento, :admin_username)

    render(conn, "index.html",
      check_service_base_url: check_service_base_url,
      charts_enabled: charts_enabled,
      deregistration_debounce: deregistration_debounce,
      suse_manager_enabled: suse_manager_enabled,
      admin_username: admin_username
    )
  end
end
