defmodule Trento.Infrastructure.Prometheus.MockPrometheusApi do
  @moduledoc """
  Mocks prometheus API calls
  """

  alias Trento.Charts.ChartTimeSeriesSample

  @behaviour Trento.Infrastructure.Prometheus.Gen
  @behaviour Trento.Charts.HostDataFetcher

  @mock_devices ["/dev/sda1", "/dev/sda2", "/dev/sda3"]
  @mock_filesystems [
    "/",
    "/home",
    "/var",
    "/usr/local",
    "/srv",
    "/root",
    "/opt",
    "/.snapshots",
    "/boot/efi"
  ]

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

  def devices_size(_, _),
    do: {:ok, Enum.map(@mock_devices, &random_devices_data(&1, :total))}

  def devices_avail(_, _),
    do: {:ok, Enum.map(@mock_devices, &random_devices_data(&1, :avail))}

  def filesystems_size(_, _),
    do: {:ok, Enum.map(@mock_filesystems, &random_filesystem_data(&1, :total))}

  def filesystems_avail(_, _),
    do: {:ok, Enum.map(@mock_filesystems, &random_filesystem_data(&1, :avail))}

  def swap_total(_, _), do: random_swap_data(:total)

  def swap_avail(_, _), do: random_swap_data(:avail)

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

  defp random_usages(type, max_size \\ 475_906_703_360, max_avail \\ 338_771_271_680) do
    avail = Enum.random(0..max_avail)
    total = Enum.random(max_avail..max_size)

    case type do
      :total -> total
      :avail -> avail
    end
  end

  defp random_swap_data(type) do
    {:ok,
     [
       %{
         sample: %ChartTimeSeriesSample{
           timestamp: DateTime.utc_now(),
           value: random_usages(type, 2_148_335_616, 1_148_184_064)
         },
         metric: %{}
       }
     ]}
  end

  defp random_devices_data(device, type) do
    %{
      sample: %ChartTimeSeriesSample{
        timestamp: DateTime.utc_now(),
        value: random_usages(type)
      },
      metric: %{"device" => device}
    }
  end

  defp random_filesystem_data(mountpoint, type) do
    %{
      sample: %ChartTimeSeriesSample{
        timestamp: DateTime.utc_now(),
        value: random_usages(type)
      },
      metric: %{
        "device" => Enum.random(@mock_devices),
        "fstype" => Enum.random(["vfat", "btrfs", "tmpfs"]),
        "mountpoint" => mountpoint
      }
    }
  end
end
