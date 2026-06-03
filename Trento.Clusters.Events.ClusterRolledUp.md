# `Trento.Clusters.Events.ClusterRolledUp`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/events/cluster_rolled_up.ex#L4)

This event is emitted when a cluster is rolled up and its stream is archived.
It contains the snapshot of the cluster aggregate that will be used to restore the aggregate state.

# `t`

```elixir
@type t() :: %Trento.Clusters.Events.ClusterRolledUp{
  cluster_id: term(),
  snapshot: term(),
  version: term()
}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `legacy?`

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

# `supersede`

# `upcast`

# `upcast`

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
