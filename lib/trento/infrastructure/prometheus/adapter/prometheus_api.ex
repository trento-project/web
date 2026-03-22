defmodule Trento.Infrastructure.Prometheus.PrometheusApi do
  @moduledoc """
  Prometheus API adapter
  """

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Repo

  alias Trento.Infrastructure.Prometheus.ChartIntegration
  alias Trento.Infrastructure.Prometheus.PromQL

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

  def proxy_query(host_id, params) do
    query = Map.get(params, "query", "")
    query = PromQL.inject_label(query, "agentID", host_id)

    has_range_params = Map.has_key?(params, "start") and Map.has_key?(params, "end")

    if has_range_params do
      query_params =
        %{query: query, start: params["start"], end: params["end"]}
        |> maybe_put(:step, params["step"])
        |> maybe_put(:timeout, params["timeout"])

      execute_query("/api/v1/query_range", query_params)
    else
      query_params =
        %{query: query}
        |> maybe_put(:time, params["time"])
        |> maybe_put(:timeout, params["timeout"])

      execute_query("/api/v1/query", query_params)
    end
  end

  defp maybe_put(map, _key, nil), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)

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

  defp build_expected_exporters(nil), do: %{}

  defp build_expected_exporters(prometheus_targets) do
    Enum.into(prometheus_targets, %{}, fn {exporter_name, _target} ->
      {exporter_name, :critical}
    end)
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
    params = %{
      query: query,
      start: DateTime.to_iso8601(from),
      end: DateTime.to_iso8601(to),
      step: "60s"
    }

    with {:ok, result_body} <- execute_query("/api/v1/query_range", params) do
      result_body
      |> extract_results()
      |> ChartIntegration.matrix_results_to_samples()
    end
  end

  defp perform_simple_query(query) do
    time = DateTime.to_iso8601(DateTime.utc_now())

    with {:ok, result_body} <- execute_query("/api/v1/query", %{query: query, time: time}) do
      {:ok, extract_results(result_body)}
    end
  end

  defp perform_simple_query(query, time) do
    iso_time = DateTime.to_iso8601(time)

    with {:ok, result_body} <- execute_query("/api/v1/query", %{query: query, time: iso_time}) do
      result_body
      |> extract_results()
      |> ChartIntegration.vector_results_to_samples()
    end
  end

  defp execute_query(endpoint, params) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    url = "#{prometheus_url}#{endpoint}"
    headers = [{"Accept", "application/json"}]

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           http_client().get(url, headers, params: params),
         {:ok, decoded} <- Jason.decode(body) do
      {:ok, decoded}
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
