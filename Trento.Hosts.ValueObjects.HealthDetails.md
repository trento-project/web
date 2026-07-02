# `Trento.Hosts.ValueObjects.HealthDetails`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/value_objects/health_details.ex#L4)

Host health details struct.

Additional information about the fields available in the host
aggregate docstring.

# `t`

```elixir
@type t() :: %Trento.Hosts.ValueObjects.HealthDetails{
  checks_health: term(),
  saptune_health: term(),
  software_updates_discovery_health: term()
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
