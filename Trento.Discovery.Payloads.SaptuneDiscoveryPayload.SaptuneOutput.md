# `Trento.Discovery.Payloads.SaptuneDiscoveryPayload.SaptuneOutput`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery/payloads/saptune_discovery_payload.ex#L18)

Saptune Output payload

# `t`

```elixir
@type t() :: %Trento.Discovery.Payloads.SaptuneDiscoveryPayload.SaptuneOutput{
  configured_version: term(),
  notes_applied: term(),
  notes_applied_by_solution: term(),
  notes_enabled: term(),
  notes_enabled_additionally: term(),
  notes_enabled_by_solution: term(),
  package_version: term(),
  services: term(),
  solution_applied: term(),
  solution_enabled: term(),
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
