# `Trento.Support.HealthValueDetails`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/health_value_details.ex#L4)

Represent Health value with additional details.

# `t`

```elixir
@type t() :: %Trento.Support.HealthValueDetails{reason: term(), value: term()}
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

# `to_details_map`

```elixir
@spec to_details_map(map()) :: map()
```

  Utility function that converts a mapping (struct or map) of Health values into a Map of HealthValueDetails

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
