defmodule TrentoWeb.PageController do
  use TrentoWeb, :controller

  def index(conn, _params) do
    grafana_public_url = Application.fetch_env!(:trento, :grafana)[:public_url]
    check_service_base_url = Application.fetch_env!(:trento, :checks_service)[:base_url]

    deregistration_debounce = Application.fetch_env!(:trento, :deregistration_debounce)

    render(conn, "index.html",
      grafana_public_url: grafana_public_url,
      check_service_base_url: check_service_base_url,
      deregistration_debounce: deregistration_debounce
    )
  end
end
