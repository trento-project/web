# `Trento.Clusters.Projections.ClusterReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/projections/cluster_read_model.ex#L4)

Cluster read model

# `t`

```elixir
@type t() :: %Trento.Clusters.Projections.ClusterReadModel{
  __meta__: term(),
  cib_last_written: term(),
  deregistered_at: term(),
  details: term(),
  health: term(),
  hosts: term(),
  hosts_number: term(),
  id: term(),
  inserted_at: term(),
  name: term(),
  provider: term(),
  resources_number: term(),
  sap_instances: term(),
  selected_checks: term(),
  state: term(),
  tags: term(),
  type: term(),
  updated_at: term()
}
```

# `authorize`

# `authorize_operation`

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
