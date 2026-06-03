# `Trento.Clusters`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters.ex#L4)

Provides a set of functions to interact with clusters.

# `by_id`

```elixir
@spec by_id(String.t()) ::
  {:ok, Trento.Clusters.Projections.ClusterReadModel.t()} | {:error, :not_found}
```

# `enrich_cluster_model`

```elixir
@spec enrich_cluster_model(Trento.Clusters.Projections.ClusterReadModel.t()) ::
  Trento.Clusters.Projections.ClusterReadModel.t()
```

# `get_all_clusters`

```elixir
@spec get_all_clusters() :: [Trento.Clusters.Projections.ClusterReadModel.t()]
```

# `get_cluster_by_id`

```elixir
@spec get_cluster_by_id(String.t()) ::
  Trento.Clusters.Projections.ClusterReadModel.t() | nil
```

# `get_cluster_hosts`

```elixir
@spec get_cluster_hosts(String.t()) :: [Trento.Hosts.Projections.HostReadModel.t()]
```

# `get_cluster_id_by_host_id`

```elixir
@spec get_cluster_id_by_host_id(String.t()) :: String.t() | nil
```

# `get_sap_instances_by_host_id`

```elixir
@spec get_sap_instances_by_host_id(String.t()) :: [
  Trento.Clusters.ValueObjects.SapInstance.t()
]
```

# `maintenance?`

```elixir
@spec maintenance?(Trento.Clusters.Projections.ClusterReadModel.t()) :: boolean()
```

# `request_checks_execution`

```elixir
@spec request_checks_execution(String.t()) :: :ok | {:error, any()}
```

# `request_clusters_checks_execution`

```elixir
@spec request_clusters_checks_execution() :: :ok | {:error, any()}
```

# `request_host_operation`

```elixir
@spec request_host_operation(atom(), String.t(), String.t()) ::
  {:ok, String.t()} | {:error, any()}
```

# `request_operation`

```elixir
@spec request_operation(atom(), String.t(), map()) ::
  {:ok, String.t()} | {:error, any()}
```

# `resource_managed?`

```elixir
@spec resource_managed?(Trento.Clusters.Projections.ClusterReadModel.t(), String.t()) ::
  boolean()
```

# `select_checks`

```elixir
@spec select_checks(String.t(), [String.t()]) :: :ok | {:error, any()}
```

# `update_cib_last_written`

```elixir
@spec update_cib_last_written(String.t(), String.t()) ::
  {:ok, Ecto.Schema.t()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
