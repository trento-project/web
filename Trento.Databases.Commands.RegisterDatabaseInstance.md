# `Trento.Databases.Commands.RegisterDatabaseInstance`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/commands/register_database_instance.ex#L4)

Register a database instance to the monitoring system.

# `t`

```elixir
@type t() :: %Trento.Databases.Commands.RegisterDatabaseInstance{
  database_id: term(),
  features: term(),
  health: term(),
  host_id: term(),
  http_port: term(),
  https_port: term(),
  instance_hostname: term(),
  instance_number: term(),
  sid: term(),
  start_priority: term(),
  system_replication: term(),
  system_replication_active_primary_site: term(),
  system_replication_mode: term(),
  system_replication_operation_mode: term(),
  system_replication_site: term(),
  system_replication_site_id: term(),
  system_replication_source_site: term(),
  system_replication_status: term(),
  system_replication_tier: term(),
  tenants: term()
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
