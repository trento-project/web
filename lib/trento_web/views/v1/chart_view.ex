defmodule TrentoWeb.V1.ChartView do
  use TrentoWeb, :view

  def render("chart_time_series_sample.json", %{sample: %{timestamp: timestamp, value: value}}),
    do: %{timestamp: DateTime.to_unix(timestamp), value: value}

  def render("chart_time_series.json", %{label: label, series: series}) do
    rendered_series =
      render_many(series, __MODULE__, "chart_time_series_sample.json", as: :sample)

    %{label: label, series: rendered_series}
  end

  def render("host_cpu_chart.json", %{
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
      busy_iowait: render("chart_time_series.json", busy_iowait),
      busy_irqs: render("chart_time_series.json", busy_irqs),
      busy_other: render("chart_time_series.json", busy_other),
      busy_system: render("chart_time_series.json", busy_system),
      busy_user: render("chart_time_series.json", busy_user),
      idle: render("chart_time_series.json", idle)
    }
  end

  def render("host_memory_chart.json", %{
        chart: %{
          ram_total: ram_total,
          ram_cache_and_buffer: ram_cache_and_buffer,
          ram_free: ram_free,
          ram_used: ram_used,
          swap_used: swap_used
        }
      }) do
    %{
      ram_total: render("chart_time_series.json", ram_total),
      ram_cache_and_buffer: render("chart_time_series.json", ram_cache_and_buffer),
      ram_free: render("chart_time_series.json", ram_free),
      ram_used: render("chart_time_series.json", ram_used),
      swap_used: render("chart_time_series.json", swap_used)
    }
  end
end
