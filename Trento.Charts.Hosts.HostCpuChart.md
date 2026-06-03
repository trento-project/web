# `Trento.Charts.Hosts.HostCpuChart`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/charts/hosts/host_cpu_chart.ex#L4)

Represents CPU chart data for a single host

The chart has different series
  - busy_iowait
  - busy_irqs
  - busy_other
  - busy_system
  - busy_user
  - idle

# `t`

```elixir
@type t() :: %Trento.Charts.Hosts.HostCpuChart{
  busy_iowait: Trento.Charts.ChartTimeSeries.t(),
  busy_irqs: Trento.Charts.ChartTimeSeries.t(),
  busy_other: Trento.Charts.ChartTimeSeries.t(),
  busy_system: Trento.Charts.ChartTimeSeries.t(),
  busy_user: Trento.Charts.ChartTimeSeries.t(),
  idle: Trento.Charts.ChartTimeSeries.t()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
