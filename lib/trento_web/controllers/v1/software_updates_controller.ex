defmodule TrentoWeb.V1.SoftwareUpdatesController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates

  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :get_user_settings,
    summary: "Gets the user settings",
    tags: ["Platform"],
    description: "Gets the saved user settings for SUSE Manager",
    responses: [
      ok: {"The user settings", "application/json", Schema.SoftwareUpdates.UserSettings},
      not_found: Schema.NotFound.response()
    ]

  @spec get_user_settings(Plug.Conn.t(), any) :: Plug.Conn.t()
  def get_user_settings(conn, _) do
    with {:ok, settings} <- SoftwareUpdates.get_settings() do
      conn
      |> put_status(:ok)
      |> render("user_settings.json", settings)
    end
  end
end
