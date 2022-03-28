defmodule TrentoWeb.CatalogController do
  use TrentoWeb, :controller

  alias Trento.Integration.Checks

  @spec checks_catalog(Plug.Conn.t(), map) :: Plug.Conn.t()
  def checks_catalog(conn, _) do
    runner_url = "http://localhost:8080"
    case Checks.get_catalog(runner_url) do
      {:ok, catalog} ->
        conn
        |> put_status(:accepted)
        |> json(catalog.providers)

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
      end
  end

end
