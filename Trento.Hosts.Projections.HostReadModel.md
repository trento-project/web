# `Trento.Hosts.Projections.HostReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/projections/host_read_model.ex#L4)

Host read model

# `t`

```elixir
@type t() :: %Trento.Hosts.Projections.HostReadModel{
  __meta__: term(),
  agent_version: term(),
  application_instances: term(),
  arch: term(),
  cluster: term(),
  cluster_host_status: term(),
  cluster_id: term(),
  database_instances: term(),
  deregistered_at: term(),
  fully_qualified_domain_name: term(),
  health: term(),
  heartbeat: term(),
  hostname: term(),
  id: term(),
  inserted_at: term(),
  ip_addresses: term(),
  last_boot_timestamp: term(),
  last_heartbeat_timestamp: term(),
  netmasks: term(),
  prometheus_mode: term(),
  prometheus_targets: term(),
  provider: term(),
  provider_data: term(),
  saptune_status: term(),
  selected_checks: term(),
  sles_subscriptions: term(),
  systemd_units: term(),
  tags: term(),
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
