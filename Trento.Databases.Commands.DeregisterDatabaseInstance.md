# `Trento.Databases.Commands.DeregisterDatabaseInstance`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/commands/deregister_database_instance.ex#L4)

Deregister (decommission) a database instance from the monitoring system.

# `t`

```elixir
@type t() :: %Trento.Databases.Commands.DeregisterDatabaseInstance{
  database_id: term(),
  deregistered_at: term(),
  host_id: term(),
  instance_number: term()
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
