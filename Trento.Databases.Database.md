# `Trento.Databases.Database`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/database.ex#L4)

The database aggregate manages all the domain logic related to
deployed HANA database.

In order to have a fully registered database one of the next two conditions must exist:
- A HANA instance without system replication is discovered
- A HANA instance running as primary system replication instance is discovered

Once any of these conditions are met the Database is registered and all the events related
to it are available now.

# `t`

```elixir
@type t() :: %Trento.Databases.Database{
  database_id: term(),
  deregistered_at: term(),
  health: term(),
  instances: term(),
  rolling_up: term(),
  sid: term(),
  tenants: term()
}
```

# `apply`

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `execute`

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
