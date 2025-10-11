defmodule TrentoWeb.V1.AboutController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

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

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    render(conn, :about,
      about_info: %{
        version: @version,
        sles_subscriptions: Hosts.get_all_sles_subscriptions()
      }
    )
  end
end
