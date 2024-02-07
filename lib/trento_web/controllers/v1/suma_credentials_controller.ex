defmodule TrentoWeb.V1.SUMACredentialsController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates

  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :show,
    summary: "Gets the user settings",
    tags: ["Platform"],
    description: "Gets the saved user settings for SUSE Manager",
    responses: [
      ok: {"The SUSE Manager user settings", "application/json", Schema.SUMACredentials.Settings},
      not_found: Schema.NotFound.response()
    ]

  @spec show(Plug.Conn.t(), any) :: Plug.Conn.t()
  def show(conn, _) do
    with {:ok, settings} <- SoftwareUpdates.get_settings() do
      render(conn, "suma_credentials.json", %{settings: settings})
    end
  end

  operation :delete,
    summary: "Clears the SUMA credentials",
    tags: ["Platform"],
    description: "Clears the saved credentials for SUSE Manager",
    responses: [
      no_content: "Settings cleared successfully"
    ]

  @spec delete(Plug.Conn.t(), any) :: Plug.Conn.t()
  def delete(conn, _) do
    with :ok <- SoftwareUpdates.clear_settings() do
      send_resp(conn, :no_content, "")
    end
  end
end
