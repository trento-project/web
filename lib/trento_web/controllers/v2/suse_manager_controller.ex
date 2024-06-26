defmodule TrentoWeb.V2.SUSEManagerController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.SoftwareUpdates.Discovery

  alias TrentoWeb.OpenApi.V2.Schema

  alias TrentoWeb.OpenApi.V2.Schema.AvailableSoftwareUpdates.ErrataDetailsResponse

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :errata_details,
    summary: "Gets the details for an advisory",
    tags: ["Platform"],
    description: "Endpoint to fetch advisory details for a given advisory name",
    parameters: [
      advisory_name: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: [
      ok: {"Errata details for the advisory", "application/json", ErrataDetailsResponse},
      unprocessable_entity: Schema.UnprocessableEntity.response()
    ]

  @spec errata_details(Plug.Conn.t(), any) :: Plug.Conn.t()
  def errata_details(conn, %{advisory_name: advisory_name}) do
    with {:ok, errata_details} <- Discovery.get_errata_details(advisory_name),
         {:ok, fixes} <- Discovery.get_bugzilla_fixes(advisory_name) do
      render(conn, %{errata_details: errata_details, fixes: fixes})
    end
  end
end
