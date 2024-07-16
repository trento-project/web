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
      start_cursor: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :integer},
        required: false
      ],
      end_cursor: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :integer},
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
      ok: {"Activity Log settings fetched successfully", "application/json", Schema.ActivityLog}
    ]

  def get_activity_log(conn, params) do
    parsed_params =
      case params do
        [] -> %{}
        params -> parse_params(params)
      end

    with {:ok, activity_log_entries, meta} <- ActivityLog.list_activity_log(parsed_params) do
      render(conn, "activity_log.json", %{
        activity_log: activity_log_entries,
        pagination: meta
      })
    end
  end

  @default_params %{
    first: 25,
    order_by: [:inserted_at],
    order_direction: [:desc]
  }
  defp parse_params(query_params) do
    filters =
      query_params
      |> Enum.map(fn {k, v} -> handle_query_params(k, v) end)
      |> Enum.reduce([], fn
        {:filters, v}, acc -> [v | acc]
        {_, _}, acc -> acc
      end)

    parsed_params =
      query_params
      |> Enum.map(fn {k, v} -> handle_query_params(k, v) end)
      |> Enum.into(%{})
      |> Map.merge(
        # lower precedence first arg
        # higher precedence second arg
        %{filters: filters}
      )

    Map.merge(
      # lower precedence keys
      @default_params,
      # higher precedence keys
      parsed_params
    )
  end

  defp handle_query_params(:from_date, from_date),
    do: {:filters, %{field: :inserted_at, op: :<=, value: from_date}}

  defp handle_query_params(:to_date, to_date),
    do: {:filters, %{field: :inserted_at, op: :>=, value: to_date}}

  defp handle_query_params(:actor, actor),
    do: {:filters, %{field: :actor, op: :ilike_or, value: actor}}

  defp handle_query_params(:type, type),
    do: {:filters, %{field: :type, op: :ilike_or, value: type}}

  defp handle_query_params(k, v), do: {k, v}
end
