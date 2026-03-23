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

  def ram_total(host_id, from, to) do
    query = "node_memory_MemTotal_bytes{agentID=\"#{host_id}\"}"

    perform_query_range(query, from, to)
  end

  def ram_used(host_id, from, to) do
    query =
      "node_memory_MemTotal_bytes{agentID=\"#{host_id}\"} - node_memory_MemFree_bytes{agentID=\"#{host_id}\"} - (node_memory_Cached_bytes{agentID=\"#{host_id}\"} + node_memory_Buffers_bytes{agentID=\"#{host_id}\"})"

    perform_query_range(query, from, to)
  end

  def ram_cache_and_buffer(host_id, from, to) do
    query =
      "node_memory_Cached_bytes{agentID=\"#{host_id}\"} + node_memory_Buffers_bytes{agentID=\"#{host_id}\"}"

    perform_query_range(query, from, to)
  end

  def ram_free(host_id, from, to) do
    query = "node_memory_MemFree_bytes{agentID=\"#{host_id}\"}"

    perform_query_range(query, from, to)
  end

  def swap_used(host_id, from, to) do
    query =
      "(node_memory_SwapTotal_bytes{agentID=\"#{host_id}\"} - node_memory_SwapFree_bytes{agentID=\"#{host_id}\"})"

    perform_query_range(query, from, to)
  end

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

  def num_cpus(from, to) do
    query = "count(count(node_cpu_seconds_total{}) by (cpu))"

    with {:ok, [%{value: value} | _]} <- perform_query_range(query, from, to) do
      {:ok, trunc(value)}
    end
  end

  def devices_size(host_id, time) do
    query = "sum by (device) (node_filesystem_size_bytes{agentID='#{host_id}'})"

    perform_simple_query(query, time)
  end

  def devices_avail(host_id, time) do
    query = "sum by (device) (node_filesystem_avail_bytes{agentID='#{host_id}'})"

    perform_simple_query(query, time)
  end

  def filesystems_size(host_id, time) do
    query = "node_filesystem_size_bytes{agentID='#{host_id}'}"

    perform_simple_query(query, time)
  end

  def filesystems_avail(host_id, time) do
    query = "node_filesystem_avail_bytes{agentID='#{host_id}'}"

    perform_simple_query(query, time)
  end

  def swap_total(host_id, time) do
    query = "node_memory_SwapTotal_bytes{agentID='#{host_id}'}"

    perform_simple_query(query, time)
  end

  def swap_avail(host_id, time) do
    query = "node_memory_SwapFree_bytes{agentID='#{host_id}'}"

    perform_simple_query(query, time)
  end

  def get_exporters_status(host_id) do
    with %HostReadModel{prometheus_targets: prometheus_targets} <-
           Repo.get(HostReadModel, host_id),
         {:ok, results} <- perform_simple_query("up{agentID='#{host_id}'}") do
      expected_exporters = build_expected_exporters(prometheus_targets)

      queried_exporters =
        results
        |> Enum.map(&parse_exporter_status/1)
        |> Enum.into(expected_exporters)

      {:ok, queried_exporters}
    else
      nil ->
        {:error, :not_found}

      error ->
        error
    end
  end

  def query(query, time) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    url = "#{prometheus_url}/api/v1/query"
    headers = [{"Accept", "application/json"}]
    time = DateTime.to_iso8601(time)

    params = %{query: query, time: time}

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           http_client().get(url, headers, params: params),
         {:ok, result_body} <- Jason.decode(body) do
      {:ok, result_body}
    else
      error -> handle_unsuccessful_response(error)
    end
  end

  def query_range(query, from, to) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    start_parameter = DateTime.to_iso8601(from)
    end_parameter = DateTime.to_iso8601(to)

    url = "#{prometheus_url}/api/v1/query_range"
    headers = [{"Accept", "application/json"}]
    params = %{query: query, start: start_parameter, end: end_parameter, step: "60s"}

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           http_client().get(url, headers, params: params),
         {:ok, result_body} <- Jason.decode(body) do
      {:ok, result_body}
    else
      error -> handle_unsuccessful_response(error)
    end
  end

  defp build_expected_exporters(nil), do: %{}

  defp build_expected_exporters(prometheus_targets) do
    Enum.into(prometheus_targets, %{}, fn {exporter_name, _target} ->
      {exporter_name, :critical}
    end)
  end

  defp parse_exporter_status(%{
         metric: %{"exporter_name" => exporter_name},
         sample: %{
           value: value
         }
       }) do
    {exporter_name,
     case trunc(value) do
       0 ->
         :critical

       1 ->
         :passing

       _ ->
         :unknown
     end}
  end

  defp perform_query_range(query, from, to) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    start_parameter = DateTime.to_iso8601(from)
    end_parameter = DateTime.to_iso8601(to)

    url = "#{prometheus_url}/api/v1/query_range"
    headers = [{"Accept", "application/json"}]
    params = %{query: query, start: start_parameter, end: end_parameter, step: "60s"}

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           http_client().get(url, headers, params: params),
         {:ok, result_body} <- Jason.decode(body),
         query_values <- extract_results(result_body),
         {:ok, samples} <- ChartIntegration.matrix_results_to_samples(query_values) do
      {:ok, samples}
    else
      error -> handle_unsuccessful_response(error)
    end
  end

  defp perform_simple_query(query, time \\ DateTime.utc_now())

  defp perform_simple_query(query, time) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    url = "#{prometheus_url}/api/v1/query"
    headers = [{"Accept", "application/json"}]
    time = DateTime.to_iso8601(time)

    params = %{query: query, time: time}

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           http_client().get(url, headers, params: params),
         {:ok, result_body} <- Jason.decode(body),
         results <- extract_results(result_body),
         {:ok, samples} <- ChartIntegration.vector_results_to_samples(results) do
      {:ok, samples}
    else
      error -> handle_unsuccessful_response(error)
    end
  end

  defp handle_unsuccessful_response(
         {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
       ) do
    Logger.error(
      "Unexpected response from Prometheus API, status code: #{status_code}, body: #{inspect(body)}."
    )

    {:error, :unexpected_response}
  end

  defp handle_unsuccessful_response({:error, reason} = error) do
    Logger.error("Error getting data from Prometheus API: #{inspect(reason)}")

    error
  end

  defp handle_unsuccessful_response(error) do
    Logger.error("Unexpected Error getting data from Prometheus API: #{inspect(error)}")

    {:error, :unexpected_response}
  end

  defp extract_results(%{
         "data" => %{"resultType" => "matrix", "result" => [%{"values" => result_values}]}
       })
       when is_list(result_values),
       do: result_values

  defp extract_results(%{
         "data" => %{"resultType" => "vector", "result" => result_values}
       })
       when is_list(result_values),
       do: result_values

  defp extract_results(_), do: []

  defp http_client, do: Application.fetch_env!(:trento, __MODULE__)[:http_client]
end
