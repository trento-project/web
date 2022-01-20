defmodule TrontoWeb.ClusterController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @spec list(Plug.Conn.t(), map) :: Plug.Conn.t()
  def list(conn, _) do
    clusters = Monitoring.get_all_clusters()

    json(conn, clusters)
  end
end
