defmodule Trento.Integration.Checks.Runner do
  @moduledoc """
  Trento runner integration adapter
  """

  @behaviour Trento.Integration.Checks.Gen

  alias Trento.Integration.Checks.FlatCatalogDto

  @impl true
  def request_execution(execution_id, cluster_id, hosts_settings, selected_checks) do
    runner_url = runner_url()

    payload = build_payload(execution_id, cluster_id, hosts_settings, selected_checks)

    case HTTPoison.post("#{runner_url}/api/execute", payload) do
      {:ok, %HTTPoison.Response{status_code: 202}} ->
        :ok

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}

      _ ->
        {:error, :unexpected_response}
    end
  end

  @impl true
  def get_catalog do
    runner_url = runner_url()

    case HTTPoison.get("#{runner_url}/api/catalog") do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, catalog_json} -> FlatCatalogDto.new(%{checks: catalog_json})
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

  defp build_payload(execution_id, cluster_id, host_settings, selected_checks) do
    %{
      execution_id: execution_id,
      clusters: [
        %{
          cluster_id: cluster_id,
          # TODO: Use the correct provider
          provider: :azure,
          checks: selected_checks,
          hosts:
            Enum.map(host_settings, fn host ->
              %{
                host_id: host.host_id,
                address: host.ssh_address,
                user: host.user || "root"
              }
            end)
        }
      ]
    }
    |> Jason.encode!()
  end

  defp runner_url,
    do: Application.fetch_env!(:trento, __MODULE__)[:runner_url]
end
