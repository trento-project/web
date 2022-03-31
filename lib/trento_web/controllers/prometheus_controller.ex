defmodule TrentoWeb.PrometheusController do
  use TrentoWeb, :controller

  alias Trento.Integration.Prometheus

  def targets(conn, _) do
    targets = Prometheus.get_targets()

    json(conn, targets)
  end
end
