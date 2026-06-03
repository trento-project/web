# `Trento.Charts`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/charts.ex#L4)

Charts module, responsible for assembling the charts

# `host_cpu_chart`

```elixir
@spec host_cpu_chart(String.t(), DateTime.t(), DateTime.t()) ::
  {:ok, Trento.Charts.Hosts.HostCpuChart.t()} | {:error, any()}
```

# `host_filesystem_chart`

```elixir
@spec host_filesystem_chart(String.t(), DateTime.t()) ::
  {:ok, Trento.Charts.Hosts.HostFilesystemChart.t()} | {:error, any()}
```

# `host_memory_chart`

```elixir
@spec host_memory_chart(String.t(), DateTime.t(), DateTime.t()) ::
  {:ok, Trento.Charts.Hosts.HostMemoryChart.t()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
