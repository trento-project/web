defmodule TrentoWeb.V1.DiscoveryController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Discovery

  alias TrentoWeb.OpenApi.V1.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :collect,
    summary: "Collect data from the target infrastructure",
    tags: ["Agent"],
    description:
      "This endpoint is used by the agents to collect data from the target infrastructure",
    request_body: {"Discovery Event", "application/json", Schema.DiscoveryEvent},
    responses: [
      accepted: "The discovery has been accepted and the event is being processed",
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
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
