# `Trento.Clusters.ValueObjects.HanaClusterHealthDetails`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/hana_cluster_health_details.ex#L4)

Hana cluster health details.

Additional information about the fields available in the cluster
aggregate docstring.

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.HanaClusterHealthDetails{
  checks_health: term(),
  replication_health: term()
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
