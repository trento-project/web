# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistantTools do
  @moduledoc """
  AI Assistant tools for querying Trento infrastructure resources.

  Most tools are derived automatically from MCP-tagged v1 controllers via
  `TrentoWeb.AIAssistant.ToolCatalog` + `TrentoWeb.AIAssistant.ControllerTool`,
  so the controller is the single source of truth for auth, data access, and
  JSON shape. The two Prometheus tools below are kept as bespoke
  `LangChain.Function`s because they shape PromQL arguments in a way that
  is more useful for the LLM than the raw `query_metrics` controller action.
  """

  require Logger
  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Infrastructure.Prometheus
  alias Trento.Users

  alias LangChain.Function

  alias TrentoWeb.AIAssistant.{ControllerTool, ToolCatalog}

  def tools do
    catalog_tools = Enum.map(ToolCatalog.entries(), &ControllerTool.build/1)

    # IO.inspect(length(catalog_tools), label: "Number of catalog-derived tools")

    catalog_tools ++
      [
        instant_query_host_metrics_tool(),
        range_query_host_metrics_tool()
      ]
  end

  defp instant_query_host_metrics_tool do
    Function.new!(%{
      name: "Instant_query_host_prometheus_metrics",
      description:
        "Executes an arbitrary PromQL query against Prometheus, automatically injecting the host's agentID label into all vector selectors to scope results to the specified host. " <>
          "Supports only instant queries.",
      parameters_schema: %{
        type: "object",
        properties: %{
          host_id: %{
            type: "string",
            format: :uuid,
            description:
              "Unique identifier of the host to scope the query to. This value must be a valid UUID string.",
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          },
          query: %{
            description:
              "A PromQL query expression. The host's agentID label will be automatically injected into all vector selectors.",
            type: :string,
            example: "node_memory_MemTotal_bytes"
          },
          time: %{
            description:
              "Evaluation timestamp for instant queries. If not provided, the current UTC time will be used.",
            type: :string,
            format: :"date-time",
            example: "2024-01-15T10:00:00Z"
          }
        },
        required: ["host_id", "query"]
      },
      function: fn %{"host_id" => host_id, "query" => query} = args, context ->
        user = Users.get_user(context.scope.id)

        case Hosts.Policy.authorize(:query_metrics, user, HostReadModel) do
          true ->
            time = Map.get(args, :time, DateTime.utc_now())
            result = Prometheus.query(host_id, query, time)

            case result do
              {:ok, %{"data" => %{"result" => query_results}}} ->
                Jason.encode!(query_results)

              {:error, reason} ->
                Logger.warning(inspect(reason))
                "Prometheus query failed"
            end

          _ ->
            "unauthorized"
        end
      end
    })
  end

  defp range_query_host_metrics_tool do
    Function.new!(%{
      name: "Range_query_host_prometheus_metrics",
      description:
        "Executes an arbitrary PromQL query against Prometheus, automatically injecting the host's agentID label into all vector selectors to scope results to the specified host. " <>
          "Supports only range queries ('from' and 'to' must be provided).",
      parameters_schema: %{
        type: "object",
        properties: %{
          host_id: %{
            type: "string",
            format: :uuid,
            description:
              "Unique identifier of the host to scope the query to. This value must be a valid UUID string.",
            example: "d59523fc-0497-4b1e-9fdd-14aa7cda77f1"
          },
          query: %{
            description:
              "A PromQL query expression. The host's agentID label will be automatically injected into all vector selectors.",
            type: :string,
            example: "node_memory_MemTotal_bytes"
          },
          from: %{
            description:
              "Start of the time range for range queries. When both 'from' and 'to' are provided, a range query is executed instead of an instant query.",
            type: :string,
            format: :"date-time",
            example: "2024-01-15T10:00:00Z"
          },
          to: %{
            description:
              "End of the time range for range queries. Must be provided together with 'from'.",
            type: :string,
            format: :"date-time",
            example: "2024-01-15T12:00:00Z"
          }
        },
        required: ["host_id", "query", "from", "to"]
      },
      function: fn args, context ->
        user = Users.get_user(context.scope.id)

        case Hosts.Policy.authorize(:query_metrics, user, HostReadModel) do
          true ->
            host_id = Map.get(args, "host_id")
            query = Map.get(args, "query")
            from = Map.get(args, "from")
            to = Map.get(args, "to")
            result = Prometheus.query_range(host_id, query, from, to)

            case result do
              {:ok, %{"data" => %{"result" => query_results}}} ->
                Jason.encode!(query_results)

              {:error, reason} ->
                Logger.warning(inspect(reason))
                "Prometheus query failed"
            end

          _ ->
            "unauthorized"
        end
      end
    })
  end
end
