# `Trento.Clusters.ValueObjects.SapInstance`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/value_objects/sap_instance.ex#L4)

Clustered SAP instance

# `t`

```elixir
@type t() :: %Trento.Clusters.ValueObjects.SapInstance{
  hostname: term(),
  instance_number: term(),
  mounted: term(),
  name: term(),
  resource_id: term(),
  resource_type: term(),
  sid: term()
}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `get_hana_instance_sid`

```elixir
@spec get_hana_instance_sid([t()]) :: String.t()
```

# `get_sap_instance_sids`

```elixir
@spec get_sap_instance_sids([t()]) :: [String.t()]
```

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
