defmodule TrentoWeb.V1.ChartController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias TrentoWeb.OpenApi.V1.Schema

  alias Trento.Charts

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :host_cpu,
    summary: "Get a CPU chart of a host.",
    tags: ["Charts"],
    description:
      "Retrieves detailed CPU usage statistics for a specific host over a defined time interval, enabling performance analysis and resource monitoring for infrastructure management.",
    parameters: [
      id: [
        in: :path,
        required: true,
        description:
          "Unique identifier of the host for which CPU usage data is requested. This value must be a valid UUID string.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          description:
            "Unique identifier of the host for which CPU usage data is requested. This value must be a valid UUID string.",
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      from: [
        in: :query,
        required: true,
        description:
          "Specifies the start of the time interval for the CPU usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T10:00:00Z).",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description:
            "Specifies the start of the time interval for the CPU usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T10:00:00Z).",
          example: "2024-01-15T10:00:00Z"
        }
      ],
      to: [
        in: :query,
        required: true,
        description:
          "Specifies the end of the time interval for the CPU usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T12:00:00Z).",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description:
            "Specifies the end of the time interval for the CPU usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T12:00:00Z).",
          example: "2024-01-15T12:00:00Z"
        }
      ]
    ],
    responses: [
      ok:
        {"Detailed CPU usage statistics for the host over a defined time interval, supporting performance analysis and monitoring.",
         "application/json", Schema.Chart.HostCpuChart}
    ]

  def host_cpu(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_cpu_chart(id, from, to) do
      render(conn, :host_cpu_chart, chart: chart)
    end
  end

  operation :host_memory,
    summary: "Get a Memory chart of a host.",
    tags: ["Charts"],
    description:
      "Retrieves detailed memory usage statistics for a specific host over a defined time interval, supporting infrastructure monitoring and troubleshooting for system administrators.",
    parameters: [
      id: [
        in: :path,
        required: true,
        description:
          "Unique identifier of the host for which memory usage data is requested. This value must be a valid UUID string.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          description:
            "Unique identifier of the host for which memory usage data is requested. This value must be a valid UUID string.",
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      from: [
        in: :query,
        required: true,
        description:
          "Specifies the start of the time interval for the memory usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T10:00:00Z).",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description:
            "Specifies the start of the time interval for the memory usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T10:00:00Z).",
          example: "2024-01-15T10:00:00Z"
        }
      ],
      to: [
        in: :query,
        required: true,
        description:
          "Specifies the end of the time interval for the memory usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T12:00:00Z).",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          description:
            "Specifies the end of the time interval for the memory usage chart, formatted as an ISO8601 timestamp (e.g., 2024-01-15T12:00:00Z).",
          example: "2024-01-15T12:00:00Z"
        }
      ]
    ],
    responses: [
      ok:
        {"Detailed memory usage statistics for the host over a defined time interval, supporting infrastructure monitoring and troubleshooting.",
         "application/json", Schema.Chart.HostMemoryChart}
    ]

  def host_memory(conn, %{id: id, from: from, to: to}) do
    with {:ok, chart} <- Charts.host_memory_chart(id, from, to) do
      render(conn, :host_memory_chart, chart: chart)
    end
  end

  operation :host_filesystem,
    summary: "Get Filesystem chart of a host.",
    tags: ["Charts"],
    description:
      "Retrieves detailed filesystem usage metrics for a specific host at a given time, supporting infrastructure monitoring and troubleshooting for system administrators.",
    parameters: [
      id: [
        in: :path,
        required: true,
        description:
          "Unique identifier of the host for which filesystem usage data is requested. This value must be a valid UUID string.",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :uuid,
          description:
            "Unique identifier of the host for which filesystem usage data is requested. This value must be a valid UUID string.",
          example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
        }
      ],
      time: [
        in: :query,
        required: false,
        description:
          "Specifies the instant at which to retrieve the filesystem usage data. If not provided, the current time will be used. Formatted as an ISO8601 timestamp (e.g., 2024-01-15T10:00:00Z).",
        schema: %OpenApiSpex.Schema{
          type: :string,
          format: :"date-time",
          example: "2024-01-15T10:00:00Z"
        }
      ]
    ],
    responses: [
      ok: {
        "Detailed filesystem usage metrics for the host at a given moment, supporting infrastructure monitoring and troubleshooting.",
        "application/json",
        Schema.Chart.HostFilesystemChart
      },
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  def host_filesystem(conn, params) do
    with {:ok, chart} <- get_filesystem_chart(params) do
      render(conn, :host_filesystem_chart, chart: chart)
    end
  end

  defp get_filesystem_chart(%{id: id}), do: Charts.host_filesystem_chart(id)

  defp get_filesystem_chart(%{id: id, time: time}),
    do: Charts.host_filesystem_chart(id, time)
end
