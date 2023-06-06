defmodule TrentoWeb.V1.HostController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.{
    Heartbeats,
    Hosts
  }

  alias TrentoWeb.OpenApi.Schema.{
    BadRequest,
    NotFound
  }

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Target Infrastructure"]

  operation :list,
    summary: "List hosts",
    description: "List all the discovered hosts on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered hosts", "application/json", Schema.Host.HostsCollection}
    ]

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    hosts = Hosts.get_all_hosts()

    render(conn, "hosts.json", hosts: hosts)
  end

  operation :delete,
    summary: "Deregister a host",
    description: "Deregister a host agent from Trento",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      no_content: "The host has been deregistered",
      not_found: TrentoWeb.OpenApi.Schema.NotFound.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  @spec delete(Plug.Conn.t(), map) :: Plug.Conn.t()
  def delete(conn, %{id: host_id}) do
    case Hosts.deregister_host(host_id) do
      :ok -> send_resp(conn, 204, "")
      {:error, error} -> {:error, error}
    end
  end

  operation :heartbeat,
    summary: "Signal that an agent is alive",
    tags: ["Agent"],
    description: "This is used by the agents to signal that they are still alive.",
    parameters: [
      id: [
        in: :path,
        required: true,
        type: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: [
      no_content: "The heartbeat has been updated",
      not_found: NotFound.response(),
      bad_request: BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def heartbeat(conn, %{id: id}) do
    with :ok <- Heartbeats.heartbeat(id) do
      send_resp(conn, 204, "")
    end
  end
end
