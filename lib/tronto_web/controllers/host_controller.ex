defmodule TrontoWeb.HostController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()

  def list(conn, _) do
    hosts = Monitoring.get_all_hosts() |> to_map

    json(conn, hosts)
  end

  def heartbeat(conn, %{"id" => id}) do
    case Monitoring.Heartbeats.heartbeat(id) do
      {:ok, _} ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      {:error, _, reason, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end
end
