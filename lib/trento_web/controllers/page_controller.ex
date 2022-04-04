defmodule TrentoWeb.PageController do
  use TrentoWeb, :controller

  def index(conn, _params) do
    grafana_public_url = Application.fetch_env!(:trento, :grafana)[:public_url]

    render(conn, "index.html", grafana_public_url: grafana_public_url)
  end
end
