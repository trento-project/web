defmodule Trento.ChartsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Charts.Hosts.{
    HostCpuChart,
    HostFilesystemChart,
    HostMemoryChart
  }

  describe "host cpu charts" do
    setup do
      insert(:host, id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4")

      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: DateTime.from_unix!(1_702_316_008),
        to: DateTime.from_unix!(1_702_316_102)
      }
    end

    test "should return an error if the host does not exists", %{
      from: from,
      to: to
    } do
      assert {:error, :not_found} = Trento.Charts.host_cpu_chart(Faker.UUID.v4(), from, to)
    end

    test "should return results for each section of the cpu chart when data is found", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              %HostCpuChart{
                busy_iowait: busy_iowait,
                busy_irqs: busy_irqs,
                busy_other: busy_other,
                idle: idle,
                busy_system: busy_sytem,
                busy_user: busy_user
              }} = Trento.Charts.host_cpu_chart(prometheus_chart_agent_id, from, to)

      assert length(busy_iowait.series) == 2
      assert length(busy_irqs.series) == 2
      assert length(busy_other.series) == 2
      assert length(idle.series) == 2
      assert length(busy_sytem.series) == 2
      assert length(busy_user.series) == 2
    end

    test "should return ChartTimeSeries struct with empty series when cpu data is not found", %{
      from: from,
      to: to
    } do
      %{id: host_id} = insert(:host)

      assert {:ok,
              %HostCpuChart{
                busy_iowait: busy_iowait,
                busy_irqs: busy_irqs,
                busy_other: busy_other,
                idle: idle,
                busy_system: busy_sytem,
                busy_user: busy_user
              }} = Trento.Charts.host_cpu_chart(host_id, from, to)

      assert Enum.empty?(busy_iowait.series)
      assert Enum.empty?(busy_irqs.series)
      assert Enum.empty?(busy_other.series)
      assert Enum.empty?(idle.series)
      assert Enum.empty?(busy_sytem.series)
      assert Enum.empty?(busy_user.series)
    end
  end

  describe "host_memory_charts" do
    setup do
      insert(:host, id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4")

      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: DateTime.from_unix!(1_702_316_008),
        to: DateTime.from_unix!(1_702_316_102)
      }
    end

    test "should return an error if the host does not exists", %{
      from: from,
      to: to
    } do
      assert {:error, :not_found} = Trento.Charts.host_memory_chart(Faker.UUID.v4(), from, to)
    end

    test "should return results for each section of the memory chart when data is found", %{
      prometheus_chart_agent_id: prometheus_chart_agent_id,
      from: from,
      to: to
    } do
      assert {:ok,
              %HostMemoryChart{
                ram_free: ram_free,
                ram_total: ram_total,
                ram_used: ram_used,
                ram_cache_and_buffer: ram_cache_and_buffer,
                swap_used: swap_used
              }} = Trento.Charts.host_memory_chart(prometheus_chart_agent_id, from, to)

      assert length(ram_free.series) == 2
      assert length(ram_total.series) == 2
      assert length(ram_used.series) == 2
      assert length(ram_cache_and_buffer.series) == 2
      assert length(swap_used.series) == 2
    end

    test "should return an HostMemoryChart with empty series when no data is found", %{
      from: from,
      to: to
    } do
      %{id: host_id} = insert(:host)

      assert {:ok,
              %HostMemoryChart{
                ram_free: ram_free,
                ram_total: ram_total,
                ram_used: ram_used,
                ram_cache_and_buffer: ram_cache_and_buffer,
                swap_used: swap_used
              }} = Trento.Charts.host_memory_chart(host_id, from, to)

      assert Enum.empty?(ram_free.series)
      assert Enum.empty?(ram_total.series)
      assert Enum.empty?(ram_used.series)
      assert Enum.empty?(ram_cache_and_buffer.series)
      assert Enum.empty?(swap_used.series)
    end
  end

  describe "host filesystem charts" do
    setup do
      insert(:host, id: "f7a8969b-db9e-4162-b82a-d5cfafe1c4e9")

      expect(Trento.Support.DateService.Mock, :utc_now, fn _ ->
        DateTime.from_unix!(1_773_388_980)
      end)

      Application.put_env(:trento, Trento.Support.DateService, Trento.Support.DateService.Mock)

      on_exit(fn -> Application.put_env(:trento, Trento.Support.DateService, DateTime) end)

      %{
        prometheus_chart_agent_id: "f7a8969b-db9e-4162-b82a-d5cfafe1c4e9"
      }
    end

    test "should return an error if the host does not exists" do
      assert {:error, :not_found} = Trento.Charts.host_filesystem_chart(Faker.UUID.v4())
    end

    test "should return results for each section of the filesystem chart data when data is found",
         %{
           prometheus_chart_agent_id: prometheus_chart_agent_id
         } do
      assert {:ok,
              %HostFilesystemChart{
                devices_size: devices_size,
                devices_avail: devices_avail,
                filesystems_size: filesystems_size,
                filesystems_avail: filesystems_avail,
                swap_total: swap_total,
                swap_avail: swap_avail
              }} = Trento.Charts.host_filesystem_chart(prometheus_chart_agent_id)

      assert length(devices_size) == 3
      assert length(devices_avail) == 3
      assert length(filesystems_size) == 14
      assert length(filesystems_avail) == 14
      assert is_map(swap_total)
      assert is_map(swap_avail)

      assert Enum.all?(devices_size ++ devices_avail, fn %{metric: metric, sample: _} ->
               Map.keys(metric) == ["device"]
             end)

      assert Enum.all?(filesystems_size ++ filesystems_avail, fn %{metric: metric, sample: _} ->
               Map.keys(metric) == ["device", "fstype", "mountpoint"]
             end)

      assert Map.keys(swap_avail) == [:sample]
      assert Map.keys(swap_total) == [:sample]
    end

    test "should return empty results when no data is found" do
      %{id: host_id} = insert(:host)

      assert {:ok,
              %HostFilesystemChart{
                devices_size: devices_size,
                devices_avail: devices_avail,
                filesystems_size: filesystems_size,
                filesystems_avail: filesystems_avail,
                swap_total: swap_total,
                swap_avail: swap_avail
              }} = Trento.Charts.host_filesystem_chart(host_id)

      assert Enum.empty?(devices_size)
      assert Enum.empty?(devices_avail)
      assert Enum.empty?(filesystems_size)
      assert Enum.empty?(filesystems_avail)
      assert is_nil(swap_total)
      assert is_nil(swap_avail)
    end
  end
end
