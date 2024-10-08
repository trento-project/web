defmodule TrentoWeb.V1.ChartJSON do
  def chart_time_series_sample(%{sample: %{timestamp: timestamp, value: value}}),
    do: %{timestamp: DateTime.to_iso8601(timestamp), value: value}

  def chart_time_series(%{label: label, series: series}),
    do: %{label: label, series: Enum.map(series, &chart_time_series_sample(%{sample: &1}))}

  def host_cpu_chart(%{
        chart: %{
          busy_iowait: busy_iowait,
          busy_irqs: busy_irqs,
          busy_other: busy_other,
          busy_system: busy_system,
          busy_user: busy_user,
          idle: idle
        }
      }) do
    %{
      busy_iowait: chart_time_series(busy_iowait),
      busy_irqs: chart_time_series(busy_irqs),
      busy_other: chart_time_series(busy_other),
      busy_system: chart_time_series(busy_system),
      busy_user: chart_time_series(busy_user),
      idle: chart_time_series(idle)
    }
  end

  def host_memory_chart(%{
        chart: %{
          ram_total: ram_total,
          ram_cache_and_buffer: ram_cache_and_buffer,
          ram_free: ram_free,
          ram_used: ram_used,
          swap_used: swap_used
        }
      }) do
    %{
      ram_total: chart_time_series(ram_total),
      ram_cache_and_buffer: chart_time_series(ram_cache_and_buffer),
      ram_free: chart_time_series(ram_free),
      ram_used: chart_time_series(ram_used),
      swap_used: chart_time_series(swap_used)
    }
  end
end
