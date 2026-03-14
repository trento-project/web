defmodule TrentoWeb.V1.ChartJSON do
  def host_cpu_chart(%{
        chart: %{
          busy_iowait: busy_iowait,
          busy_irqs: busy_irqs,
          busy_other: busy_other,
          busy_system: busy_system,
          busy_user: busy_user,
          idle: idle
        }
      }),
      do: %{
        busy_iowait: chart_time_series(busy_iowait),
        busy_irqs: chart_time_series(busy_irqs),
        busy_other: chart_time_series(busy_other),
        busy_system: chart_time_series(busy_system),
        busy_user: chart_time_series(busy_user),
        idle: chart_time_series(idle)
      }

  def host_memory_chart(%{
        chart: %{
          ram_total: ram_total,
          ram_cache_and_buffer: ram_cache_and_buffer,
          ram_free: ram_free,
          ram_used: ram_used,
          swap_used: swap_used
        }
      }),
      do: %{
        ram_total: chart_time_series(ram_total),
        ram_cache_and_buffer: chart_time_series(ram_cache_and_buffer),
        ram_free: chart_time_series(ram_free),
        ram_used: chart_time_series(ram_used),
        swap_used: chart_time_series(swap_used)
      }

  def host_filesystem_chart(%{
        chart: %{
          devices_size: devices_size,
          devices_avail: devices_avail,
          filesystems_size: filesystems_size,
          filesystems_avail: filesystems_avail,
          swap_total: swap_total,
          swap_avail: swap_avail
        }
      }),
      do: %{
        devices_size: map_sampled_metrics(devices_size),
        devices_avail: map_sampled_metrics(devices_avail),
        filesystems_size: map_sampled_metrics(filesystems_size),
        filesystems_avail: map_sampled_metrics(filesystems_avail),
        swap_total: chart_sample(swap_total),
        swap_avail: chart_sample(swap_avail)
      }

  defp chart_time_series(%{label: label, series: series}),
    do: %{label: label, series: Enum.map(series, &chart_sample(%{sample: &1}))}

  defp chart_sample(%{sample: %{timestamp: timestamp, value: value}}),
    do: %{timestamp: DateTime.to_iso8601(timestamp), value: value}

  defp chart_sample(_), do: nil

  defp map_sampled_metrics(sampled_metrics) do
    Enum.map(sampled_metrics, fn %{
                                   metric: metric,
                                   sample: sample
                                 } ->
      %{metric: metric, sample: chart_sample(%{sample: sample})}
    end)
  end
end
