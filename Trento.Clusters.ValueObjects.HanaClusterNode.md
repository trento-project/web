# `Trento.Clusters.ValueObjects.HanaClusterNode`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/hana_cluster_node.ex#L4)

Represents the node of a HANA cluster.

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.HanaClusterNode{
  attributes: term(),
  hana_status: term(),
  indexserver_actual_role: term(),
  is_majority_maker: term(),
  name: term(),
  nameserver_actual_role: term(),
  resources: term(),
  site: term(),
  status: term(),
  virtual_ip: term()
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
