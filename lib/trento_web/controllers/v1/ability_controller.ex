defmodule TrentoWeb.V1.AbilityController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Abilities

  alias TrentoWeb.OpenApi.V1.Schema.Ability.AbilityCollection

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :index,
    summary: "Gets the list of abilities in the system",
    tags: ["User Management"],
    responses: [
      ok: {"List of abilities in the system", "application/json", AbilityCollection}
    ]

  def index(conn, _params) do
    abilities = Abilities.list_abilities()
    render(conn, "index.json", abilities: abilities)
  end
end
