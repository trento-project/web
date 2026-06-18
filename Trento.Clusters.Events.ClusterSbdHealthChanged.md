# `Trento.Clusters.Events.ClusterSbdHealthChanged`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/events/cluster_sbd_health_changed.ex#L4)

This event is emitted when the health of the SBD fencing in a cluster changes.

Applies to all kinds of clusters but it's optional.

# `t`

```elixir
@type t() :: %Trento.Clusters.Events.ClusterSbdHealthChanged{
  cluster_id: term(),
  sbd_health: term(),
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
