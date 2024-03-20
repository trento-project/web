defmodule TrentoWeb.V1.SUSEManagerController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates

  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.AvailableSoftwareUpdates.AvailableSoftwareUpdatesResponse

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :software_updates,
    summary: "Gets available software updates for a given host",
    tags: ["Platform"],
    description:
      "Endpoint to fetch available relevant patches and upgradable packages for a given host ID.",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      ok:
        {"Available software updates for the host", "application/json",
         AvailableSoftwareUpdatesResponse},
      not_found: Schema.NotFound.response(),
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec software_updates(Plug.Conn.t(), any) :: Plug.Conn.t()
  def software_updates(conn, %{id: host_id}) do
    with {:ok,
          %{
            relevant_patches: relevant_patches,
            upgradable_packages: upgradable_packages
          }} <-
           SoftwareUpdates.get_software_updates(host_id) do
      render(conn, %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages})
    end
  end
end
