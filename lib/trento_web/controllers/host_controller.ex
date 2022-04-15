defmodule TrentoWeb.HostController do
  use TrentoWeb, :controller

  alias Trento.{
    Heartbeats,
    Hosts
  }

  alias Trento.Support.StructHelper

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()

  def list(conn, _) do
    # TODO: replace to_map with DTO approach
    hosts = Hosts.get_all_hosts() |> StructHelper.to_map()

    json(conn, hosts)
  end

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
