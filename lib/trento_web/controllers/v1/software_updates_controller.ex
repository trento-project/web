defmodule TrentoWeb.V1.SoftwareUpdatesController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates

  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :index,
    summary: "Gets the user settings",
    tags: ["Platform"],
    description: "Gets the saved user settings for SUSE Manager",
    responses: [
      ok:
        {"The software updates user settings", "application/json",
         Schema.SoftwareUpdates.Settings},
      not_found: Schema.NotFound.response()
    ]

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _) do
    with {:ok, settings} <- SoftwareUpdates.get_settings() do
      render(conn, "software_updates_settings.json", %{settings: settings})
    end
  end
end
