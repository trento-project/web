# `Trento.Clusters.ValueObjects.AscsErsClusterDetails`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/ascs_ers_cluster_details.ex#L4)

Represents the details of a ASCS/ERS cluster.

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.AscsErsClusterDetails{
  fencing_type: term(),
  maintenance_mode: term(),
  resources: term(),
  sap_systems: term(),
  sbd_devices: term(),
  stopped_resources: term()
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
