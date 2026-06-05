# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.V1.AboutController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs
  use Trento.AI.ControllerSpecs

  alias Trento.Hosts

  alias TrentoWeb.OpenApi.V1.Schema

  @version Mix.Project.config()[:version]

  operation :info,
    summary: "Platform General Information.",
    tags: ["Platform", "MCP"],
    description:
      "Returns general information about the current Platform installation, including version and subscription details, to help users and administrators understand the system environment.",
    responses: [
      ok:
        {"General information about the platform installation, including version and subscription details.",
         "application/json", Schema.Platform.GeneralInformation}
    ]

  ai_tool :about_info, display_text: "Get platform info"

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    versions = component_versions().get_versions(request_origin(conn))

    render(conn, :about,
      about_info:
        Map.merge(
          %{
            version: @version,
            sles_subscriptions: Hosts.get_all_sles_subscriptions()
          },
          versions
        )
    )
  end

  defp component_versions,
    do:
      Application.fetch_env!(:trento, :component_versions)[
        :adapter
      ]

  defp request_origin(%Plug.Conn{scheme: scheme, host: host, port: port}) do
    port_part =
      case {scheme, port} do
        {:http, 80} -> ""
        {:https, 443} -> ""
        {_, port} -> ":#{port}"
      end

    "#{scheme}://#{host}#{port_part}"
  end
end
