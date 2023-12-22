defmodule Trento.Charts do
  @moduledoc """
  Charts module, responsible for assembling the charts
  """

  alias Trento.Hosts

  alias Trento.Charts.Hosts.{
    HostCpuChart,
    HostMemoryChart
  }

  alias Trento.Charts.ChartTimeSeries

  @spec host_cpu_chart(String.t(), DateTime.t(), DateTime.t()) ::
          {:ok, HostCpuChart.t()} | {:error, any}
  def host_cpu_chart(host_id, from, to) do
    with {:ok, _} <- Hosts.by_host_id(host_id),
         {:ok, num_cpus} <- host_data_fetcher().num_cpus(from, to),
         {:ok, cpu_busy_iowait_samples} <-
           host_data_fetcher().cpu_busy_iowait(host_id, from, to),
         {:ok, cpu_idle_samples} <- host_data_fetcher().cpu_idle(host_id, from, to),
         {:ok, cpu_busy_system_samples} <-
           host_data_fetcher().cpu_busy_system(host_id, from, to),
         {:ok, cpu_busy_user_samples} <- host_data_fetcher().cpu_busy_user(host_id, from, to),
         {:ok, cpu_busy_irqs_samples} <- host_data_fetcher().cpu_busy_irqs(host_id, from, to),
         {:ok, cpu_busy_other_samples} <-
           host_data_fetcher().cpu_busy_other(host_id, from, to) do
      {:ok,
       %HostCpuChart{
         busy_iowait: %ChartTimeSeries{
           label: "cpu_busy_iowait",
           series: normalize_cpu_series_to_num_cpus(cpu_busy_iowait_samples, num_cpus)
         },
         idle: %ChartTimeSeries{
           label: "cpu_idle",
           series: normalize_cpu_series_to_num_cpus(cpu_idle_samples, num_cpus)
         },
         busy_system: %ChartTimeSeries{
           label: "cpu_busy_system",
           series: normalize_cpu_series_to_num_cpus(cpu_busy_system_samples, num_cpus)
         },
         busy_user: %ChartTimeSeries{
           label: "cpu_busy_user",
           series: normalize_cpu_series_to_num_cpus(cpu_busy_user_samples, num_cpus)
         },
         busy_other: %ChartTimeSeries{
           label: "cpu_busy_other",
           series: normalize_cpu_series_to_num_cpus(cpu_busy_other_samples, num_cpus)
         },
         busy_irqs: %ChartTimeSeries{
           label: "cpu_busy_irqs",
           series: normalize_cpu_series_to_num_cpus(cpu_busy_irqs_samples, num_cpus)
         }
       }}
    end
  end

  @spec host_memory_chart(String.t(), DateTime.t(), DateTime.t()) ::
          {:ok, HostMemoryChart.t()} | {:error, any}
  def host_memory_chart(host_id, from, to) do
    with {:ok, _} <- Hosts.by_host_id(host_id),
         {:ok, ram_total_samples} <- host_data_fetcher().ram_total(host_id, from, to),
         {:ok, ram_used_samples} <- host_data_fetcher().ram_used(host_id, from, to),
         {:ok, ram_cache_and_buffer_samples} <-
           host_data_fetcher().ram_cache_and_buffer(host_id, from, to),
         {:ok, ram_free_samples} <- host_data_fetcher().ram_free(host_id, from, to),
         {:ok, swap_used_samples} <- host_data_fetcher().swap_used(host_id, from, to) do
      {:ok,
       %HostMemoryChart{
         ram_total: %ChartTimeSeries{label: "ram_total", series: ram_total_samples},
         ram_used: %ChartTimeSeries{label: "ram_used", series: ram_used_samples},
         ram_cache_and_buffer: %ChartTimeSeries{
           label: "ram_cache_and_buffer",
           series: ram_cache_and_buffer_samples
         },
         ram_free: %ChartTimeSeries{label: "ram_free", series: ram_free_samples},
         swap_used: %ChartTimeSeries{label: "swap_used", series: swap_used_samples}
       }}
    end
  end

  defp host_data_fetcher, do: Application.fetch_env!(:trento, __MODULE__)[:host_data_fetcher]

  defp normalize_cpu_series_to_num_cpus(cpu_series, num_cpus) do
    Enum.map(cpu_series, fn %{timestamp: timestamp, value: value} ->
      %{timestamp: timestamp, value: value / num_cpus}
    end)
  end
end
