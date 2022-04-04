defmodule TrentoWeb.CatalogController do
  use TrentoWeb, :controller

  alias Trento.Integration.Checks

  @spec checks_catalog(Plug.Conn.t(), map) :: Plug.Conn.t()
  def checks_catalog(conn, params) do
    with {:ok, content} <- get_catalog(params),
         {:ok, filtered_content} <- filter_by_provider(content, params) do
      json(conn, filtered_content)
    else
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: :not_found})

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  defp get_catalog(%{"flat" => ""}) do
    case Checks.get_catalog() do
      {:ok, catalog} ->
        {:ok, catalog.checks}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_catalog(_) do
    case Checks.get_catalog_by_provider() do
      {:ok, catalog} ->
        {:ok, catalog.providers}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp filter_by_provider(catalog, %{"provider" => provider}) do
    filtered_catalog =
      catalog
      |> Enum.filter(fn x -> Atom.to_string(x.provider) == provider end)

    case length(filtered_catalog) > 0 do
      true -> {:ok, filtered_catalog}
      false -> {:error, :not_found}
    end
  end

  defp filter_by_provider(catalog, _) do
    {:ok, catalog}
  end
end
