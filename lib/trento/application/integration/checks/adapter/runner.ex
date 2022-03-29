defmodule Trento.Integration.Checks.Runner do
  @moduledoc """
  Trento runner integration adapter
  """

  @behaviour Trento.Integration.Checks.Gen

  require Logger

  @impl true
  def request_execution(_execution_id, _cluster_id, _hosts, _selected_checks) do
    :ok
  end

  @impl true
  def get_runner_ready_content(runner_url) do
    case HTTPoison.get("#{runner_url}/api/ready") do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        Jason.decode(body)

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

  @impl true
  def get_catalog_content(runner_url) do
    case HTTPoison.get("#{runner_url}/api/catalog") do
      {:ok, %HTTPoison.Response{status_code: 200, body: catalog_raw}} ->
        Jason.decode(catalog_raw)

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
end
