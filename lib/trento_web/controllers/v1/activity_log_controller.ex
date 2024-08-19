defmodule TrentoWeb.V1.ActivityLogController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ActivityLog
  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  plug TrentoWeb.Plugs.LoadUserPlug

  plug Bodyguard.Plug.Authorize,
    policy: Trento.ActivityLog.Policy,
    action: {Phoenix.Controller, :action_name},
    user: {Pow.Plug, :current_user},
    fallback: TrentoWeb.FallbackController

  operation :get_activity_log,
    summary: "Fetches the Activity Log entries, without the user management entries.",
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
    with {:ok, activity_log_entries, meta} <-
           ActivityLog.list_activity_log(params, false) do
      render(conn, "activity_log.json", %{
        activity_log: activity_log_entries,
        pagination: meta
      })
    end
  end

  operation :get_activity_log_all,
    summary: "Fetches all Activity Log entries, including user management.",
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
         Schema.ActivityLog.ActivityLog},
      forbidden: Schema.Forbidden.response()
    ]

  def get_activity_log_all(conn, params) do
    with {:ok, activity_log_entries, meta} <-
           ActivityLog.list_activity_log(params, true) do
      render(conn, "activity_log.json", %{
        activity_log: activity_log_entries,
        pagination: meta
      })
    end
  end
end
