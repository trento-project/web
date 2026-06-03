# `Trento.SapSystems.Projections.SapSystemReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/projections/sap_system_read_model.ex#L4)

SAP System read model

# `t`

```elixir
@type t() :: %Trento.SapSystems.Projections.SapSystemReadModel{
  __meta__: term(),
  application_instances: term(),
  database: term(),
  database_id: term(),
  database_instances: term(),
  db_host: term(),
  deregistered_at: term(),
  ensa_version: term(),
  health: term(),
  id: term(),
  inserted_at: term(),
  sid: term(),
  tags: term(),
  tenant: term(),
  updated_at: term()
}
```

# `authorize`

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
