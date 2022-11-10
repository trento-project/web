defmodule TrentoWeb.PrometheusController do
  use TrentoWeb, :controller

  alias Trento.Integration.Prometheus

  require Logger

  def targets(conn, _) do
    targets = Prometheus.get_targets()

    render(conn, "targets.json", hosts: targets)
  end

  def exporters_status(conn, %{"id" => host_id}) do
    case Prometheus.get_exporters_status(host_id) do
      {:ok, exporters_status} ->
        json(conn, exporters_status)

      {:error, reason} ->
        Logger.error("Failed to get exporters status:", error: inspect(reason))

        conn
        |> put_status(500)
        |> json(%{error: "An error occurred in getting exporters status."})
    end
  end
end
