defmodule Trento.Infrastructure.Prometheus.MockPrometheusApi do
  @moduledoc """
  Mocks prometheus API calls
  """

  alias Trento.Charts.ChartTimeSeriesSample

  @behaviour Trento.Infrastructure.Prometheus.Gen
  @behaviour Trento.Charts.HostDataFetcher

  def cpu_busy_iowait(_, from, to), do: random_chart_data(from, to)
  def cpu_idle(_, from, to), do: random_chart_data(from, to)
  def cpu_busy_system(_, from, to), do: random_chart_data(from, to)
  def cpu_busy_user(_, from, to), do: random_chart_data(from, to)
  def cpu_busy_other(_, from, to), do: random_chart_data(from, to)
  def cpu_busy_irqs(_, from, to), do: random_chart_data(from, to)
  def ram_total(_, from, to), do: random_chart_data(from, to, 0..30_000)
  def ram_used(_, from, to), do: random_chart_data(from, to, 0..30_000)
  def ram_cache_and_buffer(_, from, to), do: random_chart_data(from, to, 0..30_000)
  def ram_free(_, from, to), do: random_chart_data(from, to, 0..30_000)
  def swap_used(_, from, to), do: random_chart_data(from, to, 0..30_000)
  def num_cpus(_, _), do: {:ok, 8}
  def get_exporters_status(_), do: {:ok, %{"Node Exporter" => :passing}}

  defp random_chart_data(from, to, interval \\ 0..100) do
    minute_difference = trunc(DateTime.diff(from, to, :minute) / 5)

    samples =
      Enum.with_index(0..minute_difference, fn _, step ->
        sample_ts = DateTime.add(from, step * 5, :minute)
        sample_value = Enum.random(interval)
        %ChartTimeSeriesSample{timestamp: sample_ts, value: sample_value}
      end)

    {:ok, samples}
  end
end
