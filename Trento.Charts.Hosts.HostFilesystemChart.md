# `Trento.Charts.Hosts.HostFilesystemChart`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/charts/hosts/host_filesystem_chart.ex#L4)

Represents filesystem metrics for a host

# `t`

```elixir
@type t() :: %Trento.Charts.Hosts.HostFilesystemChart{
  devices_avail: [Trento.Charts.SampledMetric.t()],
  devices_size: [Trento.Charts.SampledMetric.t()],
  filesystems_avail: [Trento.Charts.SampledMetric.t()],
  filesystems_size: [Trento.Charts.SampledMetric.t()],
  swap_avail: Trento.Charts.ChartTimeSeriesSample.t(),
  swap_total: Trento.Charts.ChartTimeSeriesSample.t()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
