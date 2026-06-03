# `Trento.Databases.Projections.DatabaseReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/projections/database_read_model.ex#L4)

Database read model

# `t`

```elixir
@type t() :: %Trento.Databases.Projections.DatabaseReadModel{
  __meta__: term(),
  database_instances: term(),
  deregistered_at: term(),
  health: term(),
  id: term(),
  inserted_at: term(),
  sap_systems: term(),
  sid: term(),
  tags: term(),
  tenants: term(),
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
