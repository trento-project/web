defmodule TrontoWeb.DiscoveryController do
  use TrontoWeb, :controller

  alias Tronto.Monitoring

  @spec collect(Plug.Conn.t(), map) :: Plug.Conn.t()
  def collect(conn, event) do

    case Monitoring.handle_discovery_event(event) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})
      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end
end
