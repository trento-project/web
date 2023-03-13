defmodule TrentoWeb.V1.HostController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.{
    Heartbeats,
    Hosts
  }

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  tags ["Target Infrastructure"]

  operation :list,
    summary: "List hosts",
    description: "List all the discovered hosts on the target infrastructure",
    responses: [
      ok:
        {"A collection of the discovered hosts", "application/json",
         TrentoWeb.OpenApi.Schema.Host.HostsCollection}
    ]

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    hosts = Hosts.get_all_hosts()

    render(conn, "hosts.json", hosts: hosts)
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
      not_found: TrentoWeb.OpenApi.Schema.NotFound.response(),
      bad_request: TrentoWeb.OpenApi.Schema.BadRequest.response(),
      unprocessable_entity: OpenApiSpex.JsonErrorResponse.response()
    ]

  def heartbeat(conn, %{id: id}) do
    case Heartbeats.heartbeat(id) do
      {:ok, _} ->
        send_resp(conn, 204, "")

      {:error, :command, :host_not_registered, _} ->
        {:error, {:not_found, "Host not found"}}

      {:error, _, _, _} ->
        {:error, {:internal_error, "An error occurred while updating the heartbeat."}}
    end
  end
end
