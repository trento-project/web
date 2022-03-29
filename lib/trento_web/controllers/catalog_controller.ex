defmodule TrentoWeb.CatalogController do
  use TrentoWeb, :controller

  alias Trento.Integration.Checks

  @spec checks_catalog(Plug.Conn.t(), map) :: Plug.Conn.t()
  def checks_catalog(conn, _) do
    case Checks.get_catalog() do
      {:ok, catalog} ->
        json(conn, catalog.providers)

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end
end
