# `Trento.SapSystems.Events.DatabaseDeregistered`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/events/legacy/database_deregistered.ex#L4)

This event is emitted once all database instances belonging to a HANA database have been deregistered (decommissioned) from the SAP system.

# `t`

```elixir
@type t() :: %Trento.SapSystems.Events.DatabaseDeregistered{
  deregistered_at: term(),
  sap_system_id: term(),
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
