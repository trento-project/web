# `Trento.SapSystems.Events.ApplicationInstanceDataMarkedStale`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/events/application_instance_data_marked_stale.ex#L4)

This event is emitted when an application instance data is marked as stale.

# `t`

```elixir
@type t() :: %Trento.SapSystems.Events.ApplicationInstanceDataMarkedStale{
  host_id: term(),
  instance_number: term(),
  sap_system_id: term(),
  stale_at: term(),
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
