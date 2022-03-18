defmodule TrentoWeb.AboutController do
  use TrentoWeb, :controller

  alias Trento.Monitoring

  @version Mix.Project.config()[:version]
  # TODO determine Flavor
  @flavor "Community"

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    json(conn, %{
      flavor: @flavor,
      version: @version,
      sles_subscriptions: Monitoring.get_all_sles_subscriptions()
    })
  end
end
