defmodule TrentoWeb.HealthOverviewController do
  use TrentoWeb, :controller

  alias Trento.SapSystems.HealthSummaryService

  def overview(conn, _) do
    summary = HealthSummaryService.get_health_summary()

    json(conn, summary)
  end
end
