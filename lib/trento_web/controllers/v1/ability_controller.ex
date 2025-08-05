defmodule TrentoWeb.V1.AbilityController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Abilities

  alias TrentoWeb.OpenApi.V1.Schema.Ability.AbilityCollection

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :index,
    summary: "Gets the list of abilities in the system.",
    description:
      "Returns a comprehensive list of all abilities currently available in the system, allowing clients to understand supported actions and permissions for user management and access control.",
    tags: ["User Management"],
    responses: [
      ok:
        {"Comprehensive list of all abilities available for user management and access control in the system.",
         "application/json", AbilityCollection}
    ]

  def index(conn, _params) do
    abilities = Abilities.list_abilities()
    render(conn, :index, abilities: abilities)
  end
end
