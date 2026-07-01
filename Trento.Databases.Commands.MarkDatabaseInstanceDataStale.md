# `Trento.Databases.Commands.MarkDatabaseInstanceDataStale`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/commands/mark_database_instance_data_stale.ex#L4)

Mark a database instance data as stale.

# `t`

```elixir
@type t() :: %Trento.Databases.Commands.MarkDatabaseInstanceDataStale{
  database_id: term(),
  host_id: term(),
  instance_number: term(),
  stale_at: term()
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
