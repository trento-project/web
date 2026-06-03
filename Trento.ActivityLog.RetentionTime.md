# `Trento.ActivityLog.RetentionTime`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/activity_logging/retention_time.ex#L4)

This module Represents the Activity Log Retention Time

# `t`

```elixir
@type t() :: %Trento.ActivityLog.RetentionTime{unit: term(), value: term()}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `default`

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
