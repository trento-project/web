defmodule Trento.Infrastructure.Prometheus.PromQLTest do
  use ExUnit.Case, async: true

  alias Trento.Infrastructure.Prometheus.PromQL

  describe "inject_label" do
    test "injects label into bare metric name" do
      query = "up"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\"}"
    end

    test "injects label into metric with existing labels" do
      query = "node_cpu_seconds_total{mode=\"idle\"}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "node_cpu_seconds_total{agentID=\"host-123\",mode=\"idle\"}"
    end

    test "strips existing label and replaces it" do
      query = "up{agentID=\"other-host\",job=\"node\"}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\",job=\"node\"}"
    end

    test "injects label into empty label matchers" do
      query = "up{}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\"}"
    end

    test "does not modify PromQL keywords" do
      query = "sum(up) by (instance)"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "sum(up{agentID=\"host-123\"}) by (instance)"
    end

    test "works with arbitrary label names" do
      query = "up{job=\"node\"}"
      result = PromQL.inject_label(query, "namespace", "production")
      assert result == "up{namespace=\"production\",job=\"node\"}"
    end

    test "replaces existing arbitrary label" do
      query = "up{namespace=\"staging\"}"
      result = PromQL.inject_label(query, "namespace", "production")
      assert result == "up{namespace=\"production\"}"
    end

    # Multiple selectors
    test "injects into multiple metrics in a binary expression" do
      query = "up + node_load1"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\"} + node_load1{agentID=\"host-123\"}"
    end

    test "injects into both sides of a complex arithmetic expression" do
      query = "node_memory_MemTotal_bytes - node_memory_MemFree_bytes"
      result = PromQL.inject_label(query, "agentID", "host-123")

      assert result ==
               "node_memory_MemTotal_bytes{agentID=\"host-123\"} - node_memory_MemFree_bytes{agentID=\"host-123\"}"
    end

    # Range vectors
    test "injects into metric inside rate() with range vector" do
      query = "rate(node_cpu_seconds_total[5m])"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "rate(node_cpu_seconds_total{agentID=\"host-123\"}[5m])"
    end

    test "injects into metric with labels inside rate() with range vector" do
      query = "rate(node_cpu_seconds_total{mode=\"idle\"}[5m])"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "rate(node_cpu_seconds_total{agentID=\"host-123\",mode=\"idle\"}[5m])"
    end

    test "handles irate with range vector" do
      query = "irate(node_network_receive_bytes_total[1m])"
      result = PromQL.inject_label(query, "agentID", "h1")
      assert result == "irate(node_network_receive_bytes_total{agentID=\"h1\"}[1m])"
    end

    # Grouping clauses
    test "does not inject into grouping labels after by clause" do
      query = "sum by (instance)(rate(up[5m]))"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "sum by (instance)(rate(up{agentID=\"host-123\"}[5m]))"
    end

    test "does not inject into grouping labels after without clause" do
      query = "sum without (instance)(up)"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "sum without (instance)(up{agentID=\"host-123\"})"
    end

    # Numeric literals and multipliers
    test "does not inject into numeric literals" do
      query = "up * 100"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\"} * 100"
    end

    test "does not inject into negative numbers" do
      query = "up > -1"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\"} > -1"
    end

    # Offset modifier
    test "handles offset modifier with duration" do
      query = "up offset 5m"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "up{agentID=\"host-123\"} offset 5m"
    end

    # Recording rules (colon-separated names)
    test "injects into recording rule names with colons" do
      query = "job:request_total:rate5m"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "job:request_total:rate5m{agentID=\"host-123\"}"
    end

    # Edge cases
    test "handles empty query string" do
      query = ""
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == ""
    end

    test "handles query with only whitespace" do
      query = "   "
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "   "
    end

    test "handles label values containing special characters" do
      query = "up"
      result = PromQL.inject_label(query, "agentID", "host/123-abc.def")
      assert result == "up{agentID=\"host/123-abc.def\"}"
    end

    test "handles label values containing escaped quotes in existing labels" do
      query = "metric{label=\"value with \\\"quotes\\\"\"}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "metric{agentID=\"host-123\",label=\"value with \\\"quotes\\\"\"}"
    end

    test "preserves multiple existing labels when injecting" do
      query = "node_cpu{mode=\"idle\",cpu=\"0\",job=\"node\"}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "node_cpu{agentID=\"host-123\",mode=\"idle\",cpu=\"0\",job=\"node\"}"
    end

    test "handles regex matchers in existing labels" do
      query = "node_cpu{mode=~\"idle|user\"}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "node_cpu{agentID=\"host-123\",mode=~\"idle|user\"}"
    end

    test "handles negation matchers in existing labels" do
      query = "node_cpu{mode!=\"idle\"}"
      result = PromQL.inject_label(query, "agentID", "host-123")
      assert result == "node_cpu{agentID=\"host-123\",mode!=\"idle\"}"
    end

    # Real-world complex queries
    test "handles a real-world CPU usage query" do
      query = "sum by (instance)(irate(node_cpu_seconds_total{mode=\"iowait\"}[5m])) * 100"
      result = PromQL.inject_label(query, "agentID", "host-123")

      assert result ==
               "sum by (instance)(irate(node_cpu_seconds_total{agentID=\"host-123\",mode=\"iowait\"}[5m])) * 100"
    end

    test "handles a real-world memory subtraction query" do
      query =
        "node_memory_MemTotal_bytes{} - node_memory_MemFree_bytes{} - (node_memory_Cached_bytes{} + node_memory_Buffers_bytes{})"

      result = PromQL.inject_label(query, "agentID", "host-123")

      assert result ==
               "node_memory_MemTotal_bytes{agentID=\"host-123\"} - node_memory_MemFree_bytes{agentID=\"host-123\"} - (node_memory_Cached_bytes{agentID=\"host-123\"} + node_memory_Buffers_bytes{agentID=\"host-123\"})"
    end

    # Stripping edge cases
    test "strips label when it is the only label" do
      query = "up{agentID=\"old\"}"
      result = PromQL.inject_label(query, "agentID", "new")
      assert result == "up{agentID=\"new\"}"
    end

    test "strips label at the beginning of multiple labels" do
      query = "up{agentID=\"old\",job=\"node\"}"
      result = PromQL.inject_label(query, "agentID", "new")
      assert result == "up{agentID=\"new\",job=\"node\"}"
    end

    test "strips label at the end of multiple labels" do
      query = "up{job=\"node\",agentID=\"old\"}"
      result = PromQL.inject_label(query, "agentID", "new")
      assert result == "up{agentID=\"new\",job=\"node\"}"
    end

    test "strips label in the middle of multiple labels" do
      query = "up{job=\"node\",agentID=\"old\",mode=\"idle\"}"
      result = PromQL.inject_label(query, "agentID", "new")
      assert result == "up{agentID=\"new\",job=\"node\",mode=\"idle\"}"
    end
  end
end
