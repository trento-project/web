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

  @spec host_cpu_chart(String.t(), integer(), integer()) ::
          {:ok, HostCpuChart.t()} | {:error, any}
  def host_cpu_chart(host_id, from, to) do
    IO.inspect(from, label: "from")
    IO.inspect(to, label: "to")

    with {:ok, _} <- Hosts.by_host_id(host_id),
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
         busy_iowait: %ChartTimeSeries{label: "cpu_busy_iowait", series: cpu_busy_iowait_samples},
         idle: %ChartTimeSeries{label: "cpu_idle", series: cpu_idle_samples},
         busy_system: %ChartTimeSeries{label: "cpu_busy_system", series: cpu_busy_system_samples},
         busy_user: %ChartTimeSeries{label: "cpu_busy_user", series: cpu_busy_user_samples},
         busy_other: %ChartTimeSeries{label: "cpu_busy_other", series: cpu_busy_other_samples},
         busy_irqs: %ChartTimeSeries{label: "cpu_busy_irqs", series: cpu_busy_irqs_samples}
       }}
    end
  end

  @spec host_memory_chart(String.t(), integer(), integer()) ::
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
end
