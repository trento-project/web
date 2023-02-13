defmodule TrentoWeb.V1.HostController do
  use TrentoWeb, :controller

  alias Trento.{
    Heartbeats,
    Hosts
  }

  use OpenApiSpex.ControllerSpecs

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

  operation :heartbeat, false

  def heartbeat(conn, %{"id" => id}) do
    case Heartbeats.heartbeat(id) do
      {:ok, _} ->
        send_resp(conn, 204, "")

      {:error, _, reason, _} ->
        {:error, {:bad_request, reason}}
    end
  end
end
