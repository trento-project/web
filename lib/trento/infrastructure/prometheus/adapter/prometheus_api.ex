defmodule Trento.Infrastructure.Prometheus.PrometheusApi do
  @moduledoc """
  Prometheus API adapter
  """

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Repo

  alias Trento.Infrastructure.Prometheus.ChartIntegration

  require Logger

  @behaviour Trento.Infrastructure.Prometheus.Gen
  @behaviour Trento.Charts.HostDataFetcher

  def cpu_busy_irqs(host_id, from, to) do
    query =
      "sum by (instance)(irate(node_cpu_seconds_total{mode=~\".*irq\",agentID=\"#{host_id}\"}[5m])) * 100"

    perform_query_range(query, from, to)
  end

  def cpu_busy_other(host_id, from, to) do
    query =
      "sum (irate(node_cpu_seconds_total{mode!='idle',mode!='user',mode!='system',mode!='iowait',mode!='irq',mode!='softirq',agentID=\"#{host_id}\"}[5m])) * 100"

    perform_query_range(query, from, to)
  end

  def cpu_busy_iowait(host_id, from, to) do
    query =
      "sum by (instance)(irate(node_cpu_seconds_total{mode=\"iowait\", agentID=\"#{host_id}\"}[5m])) * 100"

    perform_query_range(query, from, to)
  end

  def cpu_busy_user(host_id, from, to) do
    query =
      "sum by (instance)(irate(node_cpu_seconds_total{mode=\"user\", agentID=\"#{host_id}\"}[5m])) * 100"

    perform_query_range(query, from, to)
  end

  def cpu_idle(host_id, from, to) do
    query =
      "sum by (mode)(irate(node_cpu_seconds_total{mode='idle',agentID=\"#{host_id}\"}[5m])) * 100"

    perform_query_range(query, from, to)
  end

  def cpu_busy_system(host_id, from, to) do
    query =
      "sum by (instance)(irate(node_cpu_seconds_total{mode=\"system\", agentID=\"#{host_id}\"}[5m])) * 100"

    perform_query_range(query, from, to)
  end

  def get_exporters_status(host_id) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    with %HostReadModel{} <- Repo.get(HostReadModel, host_id),
         {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           HTTPoison.get("#{prometheus_url}/api/v1/query?query=up{agentID='#{host_id}'}"),
         {:ok, %{"data" => %{"result" => results}}} <- Jason.decode(body) do
      {:ok,
       results
       |> Enum.map(&parse_exporter_status/1)
       |> Enum.into(%{})}
    else
      nil ->
        {:error, :not_found}

      %HTTPoison.Response{status_code: status_code, body: body} ->
        Logger.error(
          "Unexpected response from Prometheus API, status code: #{status_code}, body: #{inspect(body)}."
        )

        {:error, :unexpected_response}

      {:error, reason} = error ->
        Logger.error("Error fetching exporters status from Prometheus API: #{inspect(reason)}")

        error
    end
  end

  defp parse_exporter_status(%{
         "metric" => %{"exporter_name" => exporter_name},
         "value" => [_, value]
       }) do
    {exporter_name,
     case value do
       "0" ->
         :critical

       "1" ->
         :passing

       _ ->
         :unknown
     end}
  end

  defp perform_query_range(query, from, to) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    request = %HTTPoison.Request{
      method: :get,
      url: "#{prometheus_url}/api/v1/query_range",
      headers: [{"Accept", "application/json"}],
      params: %{query: query, start: from, end: to, step: "43s"}
    }

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <- HTTPoison.request(request),
         {:ok, %{"data" => %{"result" => [%{"values" => query_values}]}}} <- Jason.decode(body),
         {:ok, samples} <- ChartIntegration.query_values_to_samples(query_values) do
      {:ok, samples}
    else
      %HTTPoison.Response{status_code: status_code, body: body} ->
        Logger.error(
          "Unexpected response from Prometheus API, status code: #{status_code}, body: #{inspect(body)}."
        )

        {:error, :unexpected_response}

      {:error, reason} = error ->
        Logger.error("Error getting cpu busy system data from Prometheus API: #{inspect(reason)}")

        error
    end
  end
end
