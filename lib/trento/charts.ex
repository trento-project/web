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
           host_data_fetcher().get_cpu_busy_iowait(host_id, from, to),
         {:ok, cpu_idle_samples} <- host_data_fetcher().get_cpu_idle(host_id, from, to),
         {:ok, cpu_busy_system_samples} <-
           host_data_fetcher().get_cpu_busy_system(host_id, from, to),
         {:ok, cpu_busy_user_samples} <- host_data_fetcher().get_cpu_busy_user(host_id, from, to),
         {:ok, cpu_busy_other_samples} <-
           host_data_fetcher().get_cpu_busy_other(host_id, from, to),
         {:ok,
          %{
            cpu_busy_iowait_ts: cpu_busy_iowait_ts,
            cpu_idle_ts: cpu_idle_ts,
            cpu_busy_system_ts: cpu_busy_system_ts,
            cpu_busy_user_ts: cpu_busy_user_ts,
            cpu_busy_other_ts: cpu_busy_other_ts
          }} <-
           build_host_chart_timeseries(%{
             cpu_busy_iowait_samples: cpu_busy_iowait_samples,
             cpu_idle_samples: cpu_idle_samples,
             cpu_busy_system_samples: cpu_busy_system_samples,
             cpu_busy_user_samples: cpu_busy_user_samples,
             cpu_busy_other_samples: cpu_busy_other_samples
           }) do
      HostCpuChart.new(%{
        busy_iowait: cpu_busy_iowait_ts,
        idle: cpu_idle_ts,
        busy_system: cpu_busy_system_ts,
        busy_user: cpu_busy_user_ts,
        busy_other: cpu_busy_other_ts
      })
    end
  end

  defp build_host_chart_timeseries(%{
         cpu_idle_samples: cpu_idle_samples,
         cpu_busy_iowait_samples: cpu_busy_iowait_samples,
         cpu_busy_system_samples: cpu_busy_system_samples,
         cpu_busy_user_samples: cpu_busy_user_samples,
         cpu_busy_other_samples: cpu_busy_other_samples
       }) do
    with {:ok, cpu_busy_iowait_ts} <-
           ChartTimeSeries.new(%{label: "cpu_busy_iowait", series: cpu_busy_iowait_samples}),
         {:ok, cpu_idle_ts} <-
           ChartTimeSeries.new(%{label: "cpu_idle", series: cpu_idle_samples}),
         {:ok, cpu_busy_system_ts} <-
           ChartTimeSeries.new(%{label: "cpu_busy_system", series: cpu_busy_system_samples}),
         {:ok, cpu_busy_user_ts} <-
           ChartTimeSeries.new(%{label: "cpu_busy_user", series: cpu_busy_user_samples}),
         {:ok, cpu_busy_other_ts} <-
           ChartTimeSeries.new(%{label: "cpu_busy_other", series: cpu_busy_other_samples}) do
      {:ok,
       %{
         cpu_busy_iowait_ts: cpu_busy_iowait_ts,
         cpu_idle_ts: cpu_idle_ts,
         cpu_busy_system_ts: cpu_busy_system_ts,
         cpu_busy_user_ts: cpu_busy_user_ts,
         cpu_busy_other_ts: cpu_busy_other_ts
       }}
    end
  end

  defp host_data_fetcher, do: Application.fetch_env!(:trento, __MODULE__)[:host_data_fetcher]
end
