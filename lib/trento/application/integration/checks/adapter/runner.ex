defmodule Trento.Integration.Checks.Runner do
  @moduledoc """
  Trento runner integration adapter
  """

  @behaviour Trento.Integration.Checks.Gen

  alias Trento.Integration.Checks.Models.FlatCatalog

  @impl true
  def request_execution(_execution_id, _cluster_id, _hosts, _selected_checks) do
    :ok
  end

  @impl true
  def get_catalog do
    runner_url = runner_url()

    case HTTPoison.get("#{runner_url}/api/catalog") do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, catalog_json} -> FlatCatalog.new(%{checks: catalog_json})
          {:error, reason} -> {:error, reason}
        end

      {:ok, %HTTPoison.Response{status_code: 204}} ->
        {:error, :not_ready}

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  defp runner_url,
    do: Application.fetch_env!(:trento, __MODULE__)[:runner_url]
end
