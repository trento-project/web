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
    description:
      "Retrieves a paginated and filterable list of Activity Log entries, allowing clients to monitor system events, user actions, and platform changes for auditing and troubleshooting purposes.",
    tags: ["Platform"],
    parameters: [
      first: [
        in: :query,
        description:
          "Specifies how many Activity Log entries to return starting from the beginning of the result set, supporting pagination for large datasets.",
        schema: %OpenApiSpex.Schema{type: :integer, example: 10},
        required: false
      ],
      last: [
        in: :query,
        description:
          "Specifies how many Activity Log entries to return starting from the end of the result set, useful for retrieving the most recent events.",
        schema: %OpenApiSpex.Schema{type: :integer, example: 10},
        required: false
      ],
      after: [
        in: :query,
        description:
          "A cursor value used to paginate results after a specific entry, enabling efficient navigation through large logs.",
        schema: %OpenApiSpex.Schema{type: :string, example: "cursor_after_example"},
        required: false
      ],
      before: [
        in: :query,
        description:
          "A cursor value used to paginate results before a specific entry, allowing backward navigation in the log entries.",
        schema: %OpenApiSpex.Schema{type: :string, example: "cursor_before_example"},
        required: false
      ],
      from_date: [
        in: :query,
        description:
          "Filters Activity Log entries to include only those occurring on or after the specified start date, supporting time-based queries.",
        schema: %OpenApiSpex.Schema{type: :string, example: "2024-01-01T00:00:00Z"},
        required: false
      ],
      to_date: [
        in: :query,
        description:
          "Filters Activity Log entries to include only those occurring on or before the specified end date, useful for defining a time range.",
        schema: %OpenApiSpex.Schema{type: :string, example: "2024-01-31T23:59:59Z"},
        required: false
      ],
      actor: [
        in: :query,
        description:
          "Filters Activity Log entries by one or more actors, allowing users to view actions performed by specific individuals or system accounts.",
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
        description:
          "Allows searching Activity Log entries using a keyword or phrase, helping users quickly locate relevant events or actions.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          example: "user login"
        },
        required: false,
        example: "user login"
      ],
      type: [
        in: :query,
        description:
          "Filters Activity Log entries by one or more event types, enabling users to focus on specific categories of system activity.",
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
        description:
          "Filters Activity Log entries by severity level, allowing users to prioritize or review events based on their importance or impact.",
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
        {"Comprehensive list of activity log entries retrieved for monitoring system events, user actions, and platform changes.",
         "application/json", Schema.ActivityLog.ActivityLog}
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
