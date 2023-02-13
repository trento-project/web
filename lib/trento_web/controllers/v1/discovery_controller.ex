defmodule TrentoWeb.V1.DiscoveryController do
  use TrentoWeb, :controller

  alias Trento.Integration.Discovery

  action_fallback TrentoWeb.FallbackController

  @spec collect(Plug.Conn.t(), map) :: Plug.Conn.t()
  def collect(conn, event) do
    case Discovery.handle(event) do
      :ok ->
        conn
        |> put_status(:accepted)
        |> json(%{})

      # TODO: distinguish between validiation and command dispatch errors
      {:error, _} ->
        {:error, {:bad_request, "An error occurred in handling the discovery event."}}
    end
  end
end
