defmodule TrentoWeb.V1.DiscoveryController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Discovery

  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :collect,
    summary: "Collect data from the target infrastructure.",
    tags: ["Agent"],
    description:
      "Allows agents to submit collected data from the target infrastructure for processing and analysis, supporting automated discovery and system inventory updates.",
    request_body:
      {"Request containing discovery event data collected from the target infrastructure for processing and analysis.",
       "application/json", Schema.DiscoveryEvent},
    responses: [
      accepted:
        {"Discovery event accepted for processing and infrastructure data analysis, supporting automated system inventory updates.",
         "application/json",
         %OpenApiSpex.Schema{
           type: :object,
           properties: %{},
           example: %{}
         }},
      unprocessable_entity: UnprocessableEntity.response()
    ]

  def collect(
        conn,
        _
      ) do
    %{
      agent_id: agent_id,
      discovery_type: discovery_type,
      payload: payload
    } = OpenApiSpex.body_params(conn)

    event = %{
      "agent_id" => agent_id,
      "discovery_type" => discovery_type,
      "payload" => payload
    }

    with :ok <- Discovery.handle(event) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end
end
