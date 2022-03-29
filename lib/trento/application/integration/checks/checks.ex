defmodule Trento.Integration.Checks do
  alias Trento.Integration.Checks.Models.Catalog

  @moduledoc """
  Checks runner service integration
  """
  @spec request_execution(String.t(), String.t(), [String.t()], [String.t()]) ::
          :ok | {:error, any}
  def request_execution(execution_id, cluster_id, hosts, selected_checks),
    do: adapter().request_execution(execution_id, cluster_id, hosts, selected_checks)

  @spec get_catalog() ::
          {:ok, Catalog.t()} | {:error, any}
  def get_catalog() do
    case is_catalog_ready(runner_url()) do
      :ok ->
        get_catalog_content(runner_url())

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp is_catalog_ready(runner_url) do
    case adapter().get_runner_ready_content(runner_url) do
      {:ok, content} ->
        handle_catalog_ready(content)

      {:error, reason} ->
        {:error, reason}

      _ ->
        {:error, :unexpected_responses}
    end
  end

  defp get_catalog_content(runner_url) do
    case adapter().get_catalog_content(runner_url) do
      {:ok, content} ->
        normalize_catalog(content)

      {:error, reason} ->
        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  defp handle_catalog_ready(%{"ready" => true}), do: :ok

  defp handle_catalog_ready(%{"ready" => false}),
    do: {:error, "The catalog is still being built."}

  defp normalize_catalog(catalog_raw) do
    normalized_catalog =
      catalog_raw
      |> Enum.group_by(&Map.take(&1, ["provider"]), &Map.drop(&1, ["provider"]))
      |> Enum.map(fn {key, value} -> Map.put(key, "groups", group_by_groups(value)) end)

    Catalog.new(%{providers: normalized_catalog})
  end

  defp group_by_groups(groups) do
    groups
    |> Enum.group_by(&Map.take(&1, ["group"]), &Map.drop(&1, ["group"]))
    |> Enum.map(fn {key, value} -> Map.put(key, "checks", value) end)
  end

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]

  defp runner_url,
    do: Application.fetch_env!(:trento, __MODULE__)[:runner_url]
end
