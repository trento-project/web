defmodule TrentoWeb.AboutController do
  use TrentoWeb, :controller

  alias Trento.Hosts

  alias TrentoWeb.OpenApi.Schema

  use OpenApiSpex.ControllerSpecs

  @version Mix.Project.config()[:version]

  operation :info,
    summary: "Platform General Information",
    tags: ["Platform"],
    description: "Provides general information about the current Platform installation.",
    responses: [
      ok: {"Platform Information", "application/json", Schema.Platform.GeneralInformation}
    ]

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    json(conn, %{
      flavor: Trento.Installation.flavor(),
      version: @version,
      sles_subscriptions: Hosts.get_all_sles_subscriptions()
    })
  end
end
