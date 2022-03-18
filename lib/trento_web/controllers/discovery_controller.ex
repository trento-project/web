defmodule TrentoWeb.DiscoveryController do
  use TrentoWeb, :controller

  alias Trento.Integration.Discovery

  @spec collect(Plug.Conn.t(), map) :: Plug.Conn.t()
  def collect(conn, event) do
    case Discovery.handle(event) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      # TODO: distinguish between validiation and command dispatch errors
      {:error, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "An error occurred in handling the discovery event."})
    end
  end
end
