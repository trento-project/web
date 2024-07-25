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
    parameters: [
      first: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :integer},
        required: false
      ],
      last: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :integer},
        required: false
      ],
      after: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :string},
        required: false
      ],
      before: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :string},
        required: false
      ],
      from_date: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :string},
        required: false
      ],
      to_date: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :string},
        required: false
      ],
      actor: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :array},
        required: false
      ],
      type: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :array},
        required: false
      ]
    ],
    responses: [
      ok:
        {"Activity Log settings fetched successfully", "application/json",
         Schema.ActivityLog.ActivityLog}
    ]

  def get_activity_log(conn, params) do
    with {:ok, activity_log_entries, meta} <- ActivityLog.list_activity_log(params) do
      render(conn, "activity_log.json", %{
        activity_log: activity_log_entries,
        pagination: meta
      })
    end
  end
end
