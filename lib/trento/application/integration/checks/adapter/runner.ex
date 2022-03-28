defmodule Trento.Integration.Checks.Runner do
  @moduledoc """
  Trento runner integration adapter
  """

  @behaviour Trento.Integration.Checks.Gen

  require Logger

  alias Trento.Integration.Checks.Models.Catalog

  @impl true
  def request_execution(_execution_id, _cluster_id, _hosts, _selected_checks) do
    :ok
  end

  @impl true
  def get_catalog(runner_url) do
    case is_catalog_ready(runner_url) do
      :ok ->
        get_catalog_from_runner(runner_url)
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp is_catalog_ready(runner_url) do
    case HTTPoison.get("#{runner_url}/api/ready") do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        handler_catalog_ready(Jason.decode!(body))

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error(
          "Failed getting the runner 'ready' state. Reason: #{reason}",
          error: reason
        )

        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  defp handler_catalog_ready(%{"ready" => true}), do: :ok

  defp handler_catalog_ready(%{"ready" => false}), do: {:error, "The catalog is still being built."}

  defp get_catalog_from_runner(runner_url) do
    case HTTPoison.get("#{runner_url}/api/catalog") do
      {:ok, %HTTPoison.Response{status_code: 200, body: catalog_raw}} ->
        normalize_catalog(Jason.decode!(catalog_raw))

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error(
          "Failed to get the checks catalog from the runner. Reason: #{reason}",
          error: reason
        )

        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  defp normalize_catalog(catalog_raw) do
    normalized_catalog = catalog_raw
    |> Enum.group_by(&Map.take(&1, ["provider"]), &Map.drop(&1, ["provider"]))
    |> Enum.map(fn {key, value} -> Map.put(key, "groups", group_by_groups(value)) end)

    Catalog.new(%{providers: normalized_catalog})
  end

  defp group_by_groups(groups) do
    groups
    |> Enum.group_by(&Map.take(&1, ["group"]), &Map.drop(&1, ["group"]))
    |> Enum.map(fn {key, value} -> Map.put(key, "checks", value) end)
  end
end
