defmodule TrontoWeb.HostController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()

  def list(conn, _) do
    hosts = Monitoring.get_all_hosts()

    json(conn, hosts)
  end
end
