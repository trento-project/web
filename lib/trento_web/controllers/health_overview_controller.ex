defmodule TrentoWeb.HealthOverviewController do
  use TrentoWeb, :controller

  alias TrentoWeb.OpenApi.Schema

  alias Trento.SapSystems.HealthSummaryService
  use OpenApiSpex.ControllerSpecs

  operation(:overview,
    summary: "Health overview of the disovered SAP Systems",
    tags: ["Landscape"],
    description:
      "Provide an aggregated overview of the health of the discovered SAP Systems (and their components) on the target infrastructure",
    responses: [
      ok:
        {"An overview of the health of the disovered SAP Systems and their components",
         "application/json", Schema.SAPSystem.HealthOverview}
    ]
  )

  @spec overview(Plug.Conn.t(), any) :: Plug.Conn.t()
  def overview(conn, _) do
    summary = HealthSummaryService.get_health_summary()

    json(conn, summary)
  end
end
