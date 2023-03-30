defmodule TrentoWeb.V1.DiscoveryController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Integration.Discovery

  alias TrentoWeb.OpenApi.Schema

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
    body_params = Map.get(conn, :body_params)

    event = %{
      "agent_id" => body_params.agent_id,
      "discovery_type" => body_params.discovery_type,
      "payload" => body_params.payload
    }

    with :ok <- Discovery.handle(event) do
      conn
      |> put_status(:accepted)
      |> json(%{})
    end
  end
end
