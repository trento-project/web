# `Trento.Clusters.ValueObjects.ClusterResource`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/cluster_resource.ex#L4)

Represents the resource of a HANA cluster.

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.ClusterResource{
  fail_count: term(),
  id: term(),
  managed: term(),
  node: term(),
  parent: term(),
  role: term(),
  sid: term(),
  status: term(),
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
