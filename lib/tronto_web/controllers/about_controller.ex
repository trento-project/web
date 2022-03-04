defmodule TrontoWeb.AboutController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @version Mix.Project.config()[:version]

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    sles_subscriptions = Monitoring.get_all_sles_subscriptions()

    json(conn, %{
      sles_subscriptions: sles_subscriptions,
      version: @version
    })
  end
end
