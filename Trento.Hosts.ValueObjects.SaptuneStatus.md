# `Trento.Hosts.ValueObjects.SaptuneStatus`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/value_objects/saptune_status.ex#L4)

Represents the status of Saptune.

# `t`

```elixir
@type t() :: %Trento.Hosts.ValueObjects.SaptuneStatus{
  applied_notes: term(),
  applied_solution: term(),
  configured_version: term(),
  enabled_notes: term(),
  enabled_solution: term(),
  package_version: term(),
  services: term(),
  staging: term(),
  tuning_state: term()
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
