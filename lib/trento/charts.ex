defmodule Trento.Charts do
  @moduledoc """
  Charts module, responsible for assembling the charts
  """

  alias Trento.Charts.Hosts.HostCpuChart
  alias Trento.Charts.ChartTimeSeries

  @spec host_cpu_chart(String.t(), integer(), integer()) ::
          {:ok, HostCpuChart.t()} | {:error, any}
  def host_cpu_chart(host_id, from, to) do
    with {:ok, cpu_busy_iowait_samples} <-
           host_data_fetcher().cpu_busy_iowait(host_id, from, to),
         {:ok, cpu_idle_samples} <- host_data_fetcher().cpu_idle(host_id, from, to),
         {:ok, cpu_busy_system_samples} <-
           host_data_fetcher().cpu_busy_system(host_id, from, to),
         {:ok, cpu_busy_user_samples} <- host_data_fetcher().cpu_busy_user(host_id, from, to),
         {:ok, cpu_busy_irqs_samples} <- host_data_fetcher().cpu_busy_irqs(host_id, from, to),
         {:ok, cpu_busy_other_samples} <-
           host_data_fetcher().cpu_busy_other(host_id, from, to) do
      %HostCpuChart{
        busy_iowait: %ChartTimeSeries{label: "cpu_busy_iowait", series: cpu_busy_iowait_samples},
        idle: %ChartTimeSeries{label: "cpu_idle", series: cpu_idle_samples},
        busy_system: %ChartTimeSeries{label: "cpu_busy_system", series: cpu_busy_system_samples},
        busy_user: %ChartTimeSeries{label: "cpu_busy_user", series: cpu_busy_user_samples},
        busy_other: %ChartTimeSeries{label: "cpu_busy_other", series: cpu_busy_other_samples},
        busy_irqs: %ChartTimeSeries{label: "cpu_busy_irqs", series: cpu_busy_irqs_samples}
      }
    end
  end

  defp host_data_fetcher, do: Application.fetch_env!(:trento, __MODULE__)[:host_data_fetcher]
end
