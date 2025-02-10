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
      search: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :string},
        required: false
      ],
      type: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :array},
        required: false
      ],
      severity: [
        in: :query,
        schema: %OpenApiSpex.Schema{
          type: :array,
          default: ["info", "warning", "error", "critical"]
        },
        required: false
      ]
    ],
    responses: [
      ok:
        {"Activity Log settings fetched successfully", "application/json",
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
