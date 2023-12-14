defmodule Trento.ChartsTest do
  use ExUnit.Case

  alias Trento.Charts.Hosts.{
    HostCpuChart,
    HostMemoryChart
  }

  describe "host cpu charts" do
    setup do
      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: 1_702_316_008,
        to: 1_702_316_102
      }
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

      assert length(busy_iowait.series) == 3
      assert length(busy_irqs.series) == 3
      assert length(busy_other.series) == 3
      assert length(idle.series) == 3
      assert length(busy_sytem.series) == 3
      assert length(busy_user.series) == 3
    end

    test "should return ChartTimeSeries struct with empty series when cpu data is not found", %{
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
              }} = Trento.Charts.host_cpu_chart(Faker.UUID.v4(), from, to)

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
      %{
        prometheus_chart_agent_id: "7cd181e4-0c3e-5b70-9e47-e7ed8063b1d4",
        from: 1_702_316_008,
        to: 1_702_316_102
      }
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

      assert length(ram_free.series) == 3
      assert length(ram_total.series) == 3
      assert length(ram_used.series) == 3
      assert length(ram_cache_and_buffer.series) == 3
      assert length(swap_used.series) == 3
    end

    test "should return an HostMemoryChart with empty series when no data is found", %{
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
              }} = Trento.Charts.host_memory_chart(Faker.UUID.v4(), from, to)

      assert Enum.empty?(ram_free.series)
      assert Enum.empty?(ram_total.series)
      assert Enum.empty?(ram_used.series)
      assert Enum.empty?(ram_cache_and_buffer.series)
      assert Enum.empty?(swap_used.series)
    end
  end
end
