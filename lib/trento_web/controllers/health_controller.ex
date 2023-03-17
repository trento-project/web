defmodule TrentoWeb.HealthController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Ecto.Adapters.SQL

  alias TrentoWeb.OpenApi.Schema.{
    Health,
    Ready
  }

  operation :ready,
    summary: "Trento Web ready",
    tags: ["Platform"],
    description: "Check if Trento Web is ready",
    security: [],
    responses: [
      ok: {"Trento Web is ready", "application/json", Ready}
    ]

  def ready(conn, _) do
    conn
    |> put_status(200)
    |> json(%{ready: true})
  end

  operation :health,
    summary: "Trento Web health",
    tags: ["Platform"],
    description: "Get the health status of the Trento Web platform",
    security: [],
    responses: [
      ok: {"Trento Web health status", "application/json", Health}
    ]

  def health(conn, _) do
    db_status =
      case SQL.query(Trento.Repo, "SELECT 1", []) do
        {:ok, _} -> :pass
        {:error, _} -> :fail
      end

    conn
    |> put_status(if db_status == :pass, do: 200, else: 500)
    |> render("health.json", health: %{database: db_status})
  end
end
