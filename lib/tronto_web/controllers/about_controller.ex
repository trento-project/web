defmodule TrontoWeb.AboutController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @version Mix.Project.config()[:version]
  # TODO determine Flavor
  @flavor "Community"

  @spec info(Plug.Conn.t(), map) :: Plug.Conn.t()
  def info(conn, _) do
    case Monitoring.get_all_sles_subscriptions() do
      {:error, _} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "An error occurred in retrieving SLES subscription count."})

      sles_subscriptions ->
        json(conn, %{
          flavor: @flavor,
          version: @version,
          sles_subscriptions: sles_subscriptions
        })
    end
  end
end
