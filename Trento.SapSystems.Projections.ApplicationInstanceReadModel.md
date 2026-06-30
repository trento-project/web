# `Trento.SapSystems.Projections.ApplicationInstanceReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/projections/application_instance_read_model.ex#L4)

Application instance read model

# `t`

```elixir
@type t() :: %Trento.SapSystems.Projections.ApplicationInstanceReadModel{
  __meta__: term(),
  absent_at: term(),
  features: term(),
  host: term(),
  host_id: term(),
  http_port: term(),
  https_port: term(),
  inserted_at: term(),
  instance_hostname: term(),
  instance_number: term(),
  sap_system: term(),
  sap_system_id: term(),
  sid: term(),
  stale_at: term(),
  start_priority: term(),
  status: term(),
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
