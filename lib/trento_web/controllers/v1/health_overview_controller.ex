defmodule TrentoWeb.V1.HealthOverviewController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SapSystems.HealthSummaryService

  alias TrentoWeb.OpenApi.Schema

  operation(:overview,
    summary: "Health overview of the discovered SAP Systems",
    tags: ["Target Infrastructure"],
    description:
      "Provide an aggregated overview of the health of the discovered SAP Systems (and their components) on the target infrastructure",
    responses: [
      ok:
        {"An overview of the health of the discovered SAP Systems and their components",
         "application/json", Schema.SAPSystem.HealthOverview}
    ]
  )

  @spec overview(Plug.Conn.t(), any) :: Plug.Conn.t()
  def overview(conn, _) do
    summary = HealthSummaryService.get_health_summary()

    render(conn, "overview.json", health_infos: summary)
  end
end
