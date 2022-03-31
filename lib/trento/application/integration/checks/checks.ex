defmodule Trento.Integration.Checks do
  alias Trento.Integration.Checks.Models.{
    Catalog,
    FlatCatalog
  }

  @moduledoc """
  Checks runner service integration
  """
  @spec request_execution(String.t(), String.t(), [String.t()], [String.t()]) ::
          :ok | {:error, any}
  def request_execution(execution_id, cluster_id, hosts, selected_checks),
    do: adapter().request_execution(execution_id, cluster_id, hosts, selected_checks)

  @spec get_catalog ::
          {:ok, FlatCatalog.t()} | {:error, any}
  def get_catalog do
    case adapter().get_catalog() do
      {:ok, catalog} ->
        {:ok, catalog}

      {:error, :not_ready} ->
        {:error, "The catalog is still being built. Try again in some moments"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec get_catalog_by_provider ::
          {:ok, Catalog.t()} | {:error, any}
  def get_catalog_by_provider do
    case get_catalog() do
      {:ok, content} ->
        group_by_provider_by_group(content.checks)

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp group_by_provider_by_group(flat_catalog) do
    normalized_catalog =
      flat_catalog
      |> Enum.map(&Map.from_struct/1)
      |> Enum.group_by(&Map.take(&1, [:provider]), &Map.drop(&1, [:provider]))
      |> Enum.map(fn {key, value} -> Map.put(key, :groups, group_by_group(value)) end)

    Catalog.new(%{providers: normalized_catalog})
  end

  defp group_by_group(groups) do
    groups
    |> Enum.group_by(&Map.take(&1, [:group]), &Map.drop(&1, [:group]))
    |> Enum.map(fn {key, value} -> Map.put(key, :checks, value) end)
  end

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
