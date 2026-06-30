# `Trento.SapSystems.Instance`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/instance.ex#L4)

This module represents a SAP System instance.

# `t`

```elixir
@type t() :: %Trento.SapSystems.Instance{
  absent_at: term(),
  features: term(),
  host_id: term(),
  instance_number: term(),
  sid: term(),
  stale_at: term(),
  status: term(),
  system_replication: term(),
  system_replication_mode: term(),
  system_replication_operation_mode: term(),
  system_replication_site: term(),
  system_replication_site_id: term(),
  system_replication_source_site: term(),
  system_replication_status: term(),
  system_replication_tier: term()
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
