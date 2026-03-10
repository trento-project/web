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

  @total_swap "total_swap"
  @free_swap "free_swap"
  @used_swap "used_swap"

  @swap_metrics [@total_swap, @free_swap, @used_swap]

  @size_by_device "size_by_device"
  @avail_by_device "avail_by_device"
  @used_by_device "used_by_device"

  @device_metrics [@size_by_device, @avail_by_device, @used_by_device]

  @fs_size_bytes "fs_size_bytes"
  @fs_avail_bytes "fs_avail_bytes"
  @fs_used_bytes "fs_used_bytes"

  @filesystem_metrics [@fs_size_bytes, @fs_avail_bytes, @fs_used_bytes]

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

  def filesystem_usage(host_id) do
    query =
      labeled_query(
        "sum by (device) (node_filesystem_size_bytes{agentID='#{host_id}'})",
        @size_by_device
      )
      |> or_labeled_query(
        "(sum by (device) (node_filesystem_avail_bytes{agentID='#{host_id}'}))",
        @avail_by_device
      )
      |> or_labeled_query(
        "sum by (device) (node_filesystem_size_bytes{agentID='#{host_id}'} - node_filesystem_avail_bytes{agentID='#{host_id}'})",
        @used_by_device
      )
      |> or_labeled_query("node_filesystem_size_bytes{agentID='#{host_id}'}", @fs_size_bytes)
      |> or_labeled_query("node_filesystem_avail_bytes{agentID='#{host_id}'}", @fs_avail_bytes)
      |> or_labeled_query(
        "(node_filesystem_size_bytes{agentID='#{host_id}'} - node_filesystem_avail_bytes{agentID='#{host_id}'})",
        @fs_used_bytes
      )
      |> or_labeled_query("node_memory_SwapTotal_bytes{agentID='#{host_id}'}", @total_swap)
      |> or_labeled_query("node_memory_SwapFree_bytes{agentID='#{host_id}'}", @free_swap)
      |> or_labeled_query(
        "(node_memory_SwapTotal_bytes{agentID='#{host_id}'} - node_memory_SwapFree_bytes{agentID='#{host_id}'})",
        @used_swap
      )

    with {:ok, query_results} <- perform_simple_query(query) do
      result =
        Enum.group_by(query_results, fn
          %{metric: %{"trnt_metric" => metric}} ->
            cond do
              metric in @swap_metrics ->
                :swap

              metric in @device_metrics ->
                :devices

              metric in @filesystem_metrics ->
                :filesystems

              true ->
                :ungrouped
            end

          _ ->
            :ungrouped
        end)

      {:ok,
       Map.merge(
         %{
           swap: [],
           devices: [],
           filesystems: []
         },
         result
       )}
    end
  end

  defp labeled_query(base_query, label) do
    "label_replace(
        (#{base_query}),
        'trnt_metric',
        '#{label}',
        '',
        ''
      )"
  end

  defp or_labeled_query(query1, query2, label) do
    "#{query1} or #{labeled_query(query2, label)}"
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

  defp perform_simple_query(query) do
    prometheus_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    url = "#{prometheus_url}/api/v1/query"
    headers = [{"Accept", "application/json"}]
    params = %{query: query}

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
