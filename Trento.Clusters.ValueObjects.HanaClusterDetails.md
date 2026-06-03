# `Trento.Clusters.ValueObjects.HanaClusterDetails`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/hana_cluster_details.ex#L4)

Represents the details of a HANA cluster.

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.HanaClusterDetails{
  architecture_type: term(),
  fencing_type: term(),
  hana_scenario: term(),
  maintenance_mode: term(),
  nodes: term(),
  resources: term(),
  sbd_devices: term(),
  secondary_sync_state: term(),
  sites: term(),
  sr_health_state: term(),
  stopped_resources: term(),
  system_replication_mode: term(),
  system_replication_operation_mode: term()
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
