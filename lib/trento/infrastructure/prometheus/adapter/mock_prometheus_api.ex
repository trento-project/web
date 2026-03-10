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

  def filesystem_usage(_) do
    {:ok,
     %{
       swap: random_swap_data(),
       devices: Enum.flat_map(["/dev/sda1", "/dev/sda3", "tmpfs"], &random_devices_data/1),
       filesystems:
         Enum.flat_map(
           [
             "/",
             "/home",
             "/var",
             "/usr/local",
             "/srv",
             "/root",
             "/opt",
             "/.snapshots",
             "/boot/efi"
           ],
           &random_filesystem_data/1
         )
     }}
  end

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

  defp random_usages(max_size \\ 475_906_703_360, max_avail \\ 338_771_271_680) do
    avail = Enum.random(1_000_000_000..max_avail)
    size = Enum.random(avail..max_size)
    used = size - avail

    [size, avail, used]
  end

  defp random_swap_data do
    ["used_swap", "free_swap", "total_swap"]
    |> Enum.zip(random_usages(2_148_335_616, 1_148_184_064))
    |> Enum.map(fn {metric, value} ->
      %{
        sample: %ChartTimeSeriesSample{
          timestamp: DateTime.utc_now(),
          value: value
        },
        metric: %{
          "trnt_metric" => metric
        }
      }
    end)
  end

  defp random_devices_data(device) do
    ["size_by_device", "avail_by_device", "used_by_device"]
    |> Enum.zip(random_usages())
    |> Enum.map(fn {metric, value} ->
      %{
        sample: %ChartTimeSeriesSample{
          timestamp: DateTime.utc_now(),
          value: value
        },
        metric: %{"device" => device, "trnt_metric" => metric}
      }
    end)
  end

  defp random_filesystem_data(mountpoint) do
    ["fs_size_bytes", "fs_avail_bytes", "fs_used_bytes"]
    |> Enum.zip(random_usages())
    |> Enum.map(fn {metric, value} ->
      %{
        sample: %ChartTimeSeriesSample{
          timestamp: DateTime.utc_now(),
          value: value
        },
        metric: %{
          "device" => Enum.random(["/dev/sda1", "/dev/sda3", "tmpfs"]),
          "fstype" => Enum.random(["vfat", "btrfs", "tmpfs"]),
          "mountpoint" => mountpoint,
          "trnt_metric" => metric
        }
      }
    end)
  end
end
