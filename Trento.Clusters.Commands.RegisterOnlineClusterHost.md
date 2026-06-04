# `Trento.Clusters.Commands.RegisterOnlineClusterHost`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/commands/register_online_cluster_host.ex#L4)

Register a cluster node to the monitoring system.

# `t`

```elixir
@type t() :: %Trento.Clusters.Commands.RegisterOnlineClusterHost{
  cib_last_written: term(),
  cluster_id: term(),
  designated_controller: term(),
  details: term(),
  host_id: term(),
  hosts_number: term(),
  name: term(),
  provider: term(),
  resources_number: term(),
  sap_instances: term(),
  state: term(),
  type: term()
}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `new`

```elixir
@spec new(map() | [map()]) :: {:ok, t() | [t()]} | {:error, any()}
```

Returns an ok tuple if the params are valid, otherwise returns `{:error, {:validation, errors}}`.
Accepts a map or a list of maps.

# `new!`

```elixir
@spec new!(map() | [map()]) :: t() | [t()]
```

Returns new struct(s) if the params are valid, otherwise raises a `RuntimeError`.

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
