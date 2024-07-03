defmodule TrentoWeb.V1.ActivityLogController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ActivityLog
  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :get_activity_log,
    summary: "Fetches the Activity Log entries.",
    tags: ["Platform"],
    responses: [
      ok: {"Activity Log settings fetched successfully", "application/json", Schema.ActivityLog}
    ]

  def get_activity_log(conn, _) do
    with activity_log_entries <- ActivityLog.list_activity_log() do
      render(conn, "activity_log.json", %{
        activity_log: activity_log_entries
      })
    end
  end
end
