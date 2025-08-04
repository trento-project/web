defmodule TrentoWeb.V1.ActivityLogController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.ActivityLog
  alias Trento.ActivityLog.Policy
  alias Trento.Users.User
  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController
  plug TrentoWeb.Plugs.LoadUserPlug

  operation :get_activity_log,
    summary: "Fetches the Activity Log entries.",
    description: "Fetches the Activity Log entries with pagination and filtering capabilities.",
    tags: ["Platform"],
    parameters: [
      first: [
        in: :query,
        description: "Number of items to return from the beginning.",
        schema: %OpenApiSpex.Schema{type: :integer, example: 10},
        required: false
      ],
      last: [
        in: :query,
        description: "Number of items to return from the end.",
        schema: %OpenApiSpex.Schema{type: :integer, example: 10},
        required: false
      ],
      after: [
        in: :query,
        description: "Cursor to paginate after.",
        schema: %OpenApiSpex.Schema{type: :string, example: "cursor_after_example"},
        required: false
      ],
      before: [
        in: :query,
        description: "Cursor to paginate before.",
        schema: %OpenApiSpex.Schema{type: :string, example: "cursor_before_example"},
        required: false
      ],
      from_date: [
        in: :query,
        description: "Start date for filtering entries.",
        schema: %OpenApiSpex.Schema{type: :string, example: "2024-01-01T00:00:00Z"},
        required: false
      ],
      to_date: [
        in: :query,
        description: "End date for filtering entries.",
        schema: %OpenApiSpex.Schema{type: :string, example: "2024-01-31T23:59:59Z"},
        required: false
      ],
      actor: [
        in: :query,
        description: "Filter by actor(s).",
        schema: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{type: :string},
          example: ["john.doe@example.com", "admin@example.com"]
        },
        required: false,
        example: ["john.doe@example.com", "admin@example.com"]
      ],
      search: [
        in: :query,
        description: "Search term for filtering entries.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "user login"
        },
        required: false,
        example: "user login"
      ],
      type: [
        in: :query,
        description: "Filter by entry type(s).",
        schema: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{type: :string},
          example: ["host_registered", "user_login"]
        },
        required: false,
        example: ["host_registered", "user_login"]
      ],
      severity: [
        in: :query,
        description: "Filter by severity level(s).",
        schema: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{type: :string},
          default: ["debug", "info", "warning", "critical"]
        },
        required: false
      ]
    ],
    responses: [
      ok:
        {"Activity Log settings fetched successfully.", "application/json",
         Schema.ActivityLog.ActivityLog}
    ]

  def get_activity_log(conn, params) do
    user = Pow.Plug.current_user(conn)
    include_all_logs? = Policy.include_all_logs?(user)

    with :ok <- validate_incoming_filters(params, user),
         {:ok, activity_log_entries, meta} <-
           ActivityLog.list_activity_log(params, include_all_logs?) do
      render(conn, :activity_log, %{
        activity_log: activity_log_entries,
        pagination: meta,
        current_user: user
      })
    end
  end

  defp validate_incoming_filters(params, %User{username: username} = user) do
    can_query_actor? =
      Policy.has_access_to_users?(user) ||
        params
        |> Map.get(:actor, [])
        |> Enum.all?(&(&1 == username || &1 == "system"))

    if can_query_actor? do
      :ok
    else
      {:error, :forbidden}
    end
  end
end
