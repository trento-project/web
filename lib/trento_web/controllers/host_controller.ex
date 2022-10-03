defmodule TrentoWeb.HostController do
  use TrentoWeb, :controller

  alias Trento.{
    Heartbeats,
    Hosts
  }

  alias Trento.Support.StructHelper

  use OpenApiSpex.ControllerSpecs

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
    # TODO: replace to_map with DTO approach
    hosts = StructHelper.to_map(Hosts.get_all_hosts())

    json(conn, hosts)
  end

  operation :heartbeat, false

  def heartbeat(conn, %{"id" => id}) do
    case Heartbeats.heartbeat(id) do
      {:ok, _} ->
        send_resp(conn, 204, "")

      {:error, _, reason, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end
end
