# `Trento.Charts.HostDataFetcher`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/charts/hosts/host_data_fetcher.ex#L4)

Behaviour of host charts data fetcher

# `sampled_metric`

```elixir
@type sampled_metric() :: %{
  metric: map(),
  sample: Trento.Charts.ChartTimeSeriesSample.t()
}
```

# `cpu_busy_iowait`

```elixir
@callback cpu_busy_iowait(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `cpu_busy_irqs`

```elixir
@callback cpu_busy_irqs(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `cpu_busy_other`

```elixir
@callback cpu_busy_other(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `cpu_busy_system`

```elixir
@callback cpu_busy_system(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `cpu_busy_user`

```elixir
@callback cpu_busy_user(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `cpu_idle`

```elixir
@callback cpu_idle(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `devices_avail`

```elixir
@callback devices_avail(host_id :: String.t(), time :: DateTime.t()) ::
  {:ok, [sampled_metric()]} | {:error, any()}
```

# `devices_size`

```elixir
@callback devices_size(host_id :: String.t(), time :: DateTime.t()) ::
  {:ok, [sampled_metric()]} | {:error, any()}
```

# `filesystems_avail`

```elixir
@callback filesystems_avail(host_id :: String.t(), time :: DateTime.t()) ::
  {:ok, [sampled_metric()]} | {:error, any()}
```

# `filesystems_size`

```elixir
@callback filesystems_size(host_id :: String.t(), time :: DateTime.t()) ::
  {:ok, [sampled_metric()]} | {:error, any()}
```

# `num_cpus`

```elixir
@callback num_cpus(from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, integer()} | {:error, any()}
```

# `ram_cache_and_buffer`

```elixir
@callback ram_cache_and_buffer(
  host_id :: String.t(),
  from :: DateTime.t(),
  to :: DateTime.t()
) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `ram_free`

```elixir
@callback ram_free(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `ram_total`

```elixir
@callback ram_total(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `ram_used`

```elixir
@callback ram_used(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `swap_avail`

```elixir
@callback swap_avail(host_id :: String.t(), time :: DateTime.t()) ::
  {:ok, [sampled_metric()]} | {:error, any()}
```

# `swap_total`

```elixir
@callback swap_total(host_id :: String.t(), time :: DateTime.t()) ::
  {:ok, [sampled_metric()]} | {:error, any()}
```

# `swap_used`

```elixir
@callback swap_used(host_id :: String.t(), from :: DateTime.t(), to :: DateTime.t()) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
