# `Trento.Databases.Projections.DatabaseInstanceReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/projections/database_instance_read_model.ex#L4)

Database instance read model

# `t`

```elixir
@type t() :: %Trento.Databases.Projections.DatabaseInstanceReadModel{
  __meta__: term(),
  absent_at: term(),
  database_id: term(),
  features: term(),
  host: term(),
  host_id: term(),
  http_port: term(),
  https_port: term(),
  inserted_at: term(),
  instance_hostname: term(),
  instance_number: term(),
  sid: term(),
  start_priority: term(),
  status: term(),
  system_replication: term(),
  system_replication_mode: term(),
  system_replication_operation_mode: term(),
  system_replication_site: term(),
  system_replication_site_id: term(),
  system_replication_source_site: term(),
  system_replication_status: term(),
  system_replication_tier: term(),
  updated_at: term()
}
```

# `authorize_operation`

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
