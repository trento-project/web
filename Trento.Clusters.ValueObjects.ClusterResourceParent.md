# `Trento.Clusters.ValueObjects.ClusterResourceParent`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/cluster_resource_parent.ex#L4)

Represents the parent of a cluster resource

`managed` represents the maintenance state of the resource.
`multi_state` represents the type of the group:
  - `true` means a Master/Slave group
  - `false` means a Clone group
  - `nil` means a standard Group

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.ClusterResourceParent{
  id: term(),
  managed: term(),
  multi_state: term()
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
