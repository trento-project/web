defmodule TrentoWeb.AboutController do
  use TrentoWeb, :controller

  alias Trento.Hosts

  @version Mix.Project.config()[:version]

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    json(conn, %{
      flavor: Trento.Installation.flavor(),
      version: @version,
      sles_subscriptions: Hosts.get_all_sles_subscriptions()
    })
  end
end
