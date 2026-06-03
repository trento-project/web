# `Trento.Charts.Hosts.HostMemoryChart`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/charts/hosts/host_memory_chart.ex#L4)

Represents Memory chart data for a single host

The chart has different series
  - ram_total
  - ram_used
  - ram_cache_and_buffer
  - ram_free
  - swap_used

# `t`

```elixir
@type t() :: %Trento.Charts.Hosts.HostMemoryChart{
  ram_cache_and_buffer: Trento.Charts.ChartTimeSeries.t(),
  ram_free: Trento.Charts.ChartTimeSeries.t(),
  ram_total: Trento.Charts.ChartTimeSeries.t(),
  ram_used: Trento.Charts.ChartTimeSeries.t(),
  swap_used: Trento.Charts.ChartTimeSeries.t()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
