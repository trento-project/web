defmodule TrentoWeb.HealthController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Ecto.Adapters.SQL

  alias TrentoWeb.OpenApi.V1.Schema.{
    Health,
    Ready
  }

  operation :ready,
    summary: "Trento Web ready.",
    tags: ["Platform"],
    description:
      "Performs a readiness check to determine if the Trento Web application is operational and able to serve requests. This endpoint is useful for monitoring and automation systems.",
    security: [],
    responses: [
      ok:
        {"A successful readiness check indicating that the Trento Web application is operational and ready to serve requests. Useful for monitoring and automation systems.",
         "application/json", Ready}
    ]

  def ready(conn, _) do
    conn
    |> put_status(200)
    |> json(%{ready: true})
  end

  operation :health,
    summary: "Trento Web health.",
    tags: ["Platform"],
    description:
      "Retrieves the overall health status of the Trento Web platform, including database connectivity and service availability. Use this endpoint to verify system health for diagnostics and monitoring purposes.",
    security: [],
    responses: [
      ok:
        {"A successful health check response providing the current status of the Trento Web platform, including database connectivity and service availability for diagnostics and monitoring.",
         "application/json", Health}
    ]

  def health(conn, _) do
    db_status =
      case SQL.query(Trento.Repo, "SELECT 1", []) do
        {:ok, _} -> :pass
        {:error, _} -> :fail
      end

    conn
    |> put_status(if db_status == :pass, do: 200, else: 500)
    |> render(:health, health: %{database: db_status})
  end
end
