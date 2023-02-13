defmodule TrentoWeb.V1.PrometheusController do
  use TrentoWeb, :controller

  alias Trento.Integration.Prometheus

  require Logger

  action_fallback TrentoWeb.FallbackController

  def targets(conn, _) do
    targets = Prometheus.get_targets()

    render(conn, "targets.json", targets: targets)
  end

  def exporters_status(conn, %{"id" => host_id}) do
    case Prometheus.get_exporters_status(host_id) do
      {:ok, exporters_status} ->
        render(conn, "exporters_status.json", status: exporters_status)

      {:error, reason} ->
        Logger.error("Failed to get exporters status:", error: inspect(reason))

        {:error, {:internal_error, "An error occurred in getting exporters status."}}
    end
  end
end
