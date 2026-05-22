# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ToolCatalog do
  @moduledoc """
  Opt-in registry of v1 controller actions exposed to the AI assistant as
  LangChain tools.

  Each entry is a `%TrentoWeb.AIAssistant.ToolCatalog.Entry{}` carrying the
  `{controller, action}` pair plus explicit `tool_name` and `display_text`
  labels. HTTP method and path live in `TrentoWeb.Router` and are looked up
  via `route!/1` — the router is the single source of truth for those.

  Catalog is hand-maintained; the corresponding REST endpoints are
  `tags: ["...", "MCP"]` operations consumed by the trento MCP server.
  Keep this list in sync with the MCP tag set.
  """

  alias TrentoWeb.AIAssistant.ToolCatalog.Entry
  alias TrentoWeb.V1

  @entries [
    %Entry{
      controller: V1.AbilityController,
      action: :index,
      tool_name: "Ability_list",
      display_text: "List abilities"
    },
    %Entry{
      controller: V1.AboutController,
      action: :info,
      tool_name: "About_info",
      display_text: "Get Trento platform info"
    },
    %Entry{
      controller: V1.ActivityLogController,
      action: :get_activity_log,
      tool_name: "ActivityLog_get",
      display_text: "Get activity log"
    },
    %Entry{
      controller: V1.ClusterController,
      action: :list,
      tool_name: "Cluster_list",
      display_text: "List clusters"
    },
    %Entry{
      controller: V1.ClusterController,
      action: :request_checks_execution,
      tool_name: "Cluster_request_checks_execution",
      display_text: "Request checks execution for a cluster"
    },
    %Entry{
      controller: V1.DatabaseController,
      action: :list_databases,
      tool_name: "Database_list_databases",
      display_text: "List HANA databases"
    },
    %Entry{
      controller: V1.HealthOverviewController,
      action: :overview,
      tool_name: "HealthOverview_overview",
      display_text: "Get SAP systems health overview"
    },
    %Entry{
      controller: V1.HostController,
      action: :list,
      tool_name: "Host_list",
      display_text: "List hosts"
    },
    %Entry{
      controller: V1.HostController,
      action: :request_checks_execution,
      tool_name: "Host_request_checks_execution",
      display_text: "Request checks execution for a host"
    },
    %Entry{
      controller: V1.HostController,
      action: :query_metrics,
      tool_name: "Host_query_metrics",
      display_text: "Query Prometheus metrics for a host"
    },
    %Entry{
      controller: V1.ProfileController,
      action: :show,
      tool_name: "Profile_show",
      display_text: "Get current user's profile"
    },
    %Entry{
      controller: V1.PrometheusController,
      action: :targets,
      tool_name: "Prometheus_targets",
      display_text: "List Prometheus targets"
    },
    %Entry{
      controller: V1.PrometheusController,
      action: :exporters_status,
      tool_name: "Prometheus_exporters_status",
      display_text: "Get exporters status for a host"
    },
    %Entry{
      controller: V1.SapSystemController,
      action: :list,
      tool_name: "SapSystem_list",
      display_text: "List SAP systems"
    },
    %Entry{
      controller: V1.SettingsController,
      action: :get_api_key_settings,
      tool_name: "Settings_get_api_key",
      display_text: "Get API key settings"
    },
    %Entry{
      controller: V1.SettingsController,
      action: :get_activity_log_settings,
      tool_name: "Settings_get_activity_log",
      display_text: "Get activity log settings"
    },
    %Entry{
      controller: V1.SettingsController,
      action: :get_alerting_settings,
      tool_name: "Settings_get_alerting",
      display_text: "Get alerting settings"
    },
    %Entry{
      controller: V1.SettingsController,
      action: :get_public_keys,
      tool_name: "Settings_get_public_keys",
      display_text: "Get JWT public keys"
    },
    %Entry{
      controller: V1.SettingsController,
      action: :get_suse_manager_settings,
      tool_name: "Settings_get_suse_manager",
      display_text: "Get SUSE Manager settings"
    },
    %Entry{
      controller: V1.SettingsController,
      action: :test_suse_manager_settings,
      tool_name: "Settings_test_suse_manager",
      display_text: "Test SUSE Manager connection"
    },
    %Entry{
      controller: V1.SUSEManagerController,
      action: :software_updates,
      tool_name: "SUSEManager_software_updates",
      display_text: "Get software updates for a host"
    },
    %Entry{
      controller: V1.SUSEManagerController,
      action: :patches_for_packages,
      tool_name: "SUSEManager_patches_for_packages",
      display_text: "Get patches covered by package upgrades"
    },
    %Entry{
      controller: V1.SUSEManagerController,
      action: :errata_details,
      tool_name: "SUSEManager_errata_details",
      display_text: "Get advisory errata details"
    },
    %Entry{
      controller: V1.UsersController,
      action: :index,
      tool_name: "Users_list",
      display_text: "List users"
    },
    %Entry{
      controller: V1.UsersController,
      action: :show,
      tool_name: "Users_show",
      display_text: "Get a user by id"
    }
  ]

  @spec entries() :: [Entry.t()]
  def entries, do: @entries

  @doc """
  Reverse-lookup the HTTP method (`:get`, `:post`, …) and path template
  (e.g. `/api/v1/hosts/:id/metrics/query`) for a catalog entry, against
  `TrentoWeb.Router.__routes__/0`.

  Raises if the controller/action pair is not registered in the router —
  surfaces stale entries at test/build time rather than at LLM invocation.
  """
  @spec route!(Entry.t()) :: %{verb: atom(), path: String.t()}
  def route!(%Entry{controller: controller, action: action}) do
    TrentoWeb.Router.__routes__()
    |> Enum.find(fn r -> r.plug == controller and r.plug_opts == action end)
    |> case do
      %{verb: verb, path: path} ->
        %{verb: verb, path: path}

      nil ->
        raise ArgumentError,
              "no route registered for #{inspect(controller)}.#{action} — " <>
                "the catalog entry is stale or the router has changed"
    end
  end
end
