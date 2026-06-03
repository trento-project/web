# `Trento.Hosts.Events.HostDetailsUpdated`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/events/host_details_updated.ex#L4)

This event is emitted when host details are updated.

# `t`

```elixir
@type t() :: %Trento.Hosts.Events.HostDetailsUpdated{
  agent_version: term(),
  arch: term(),
  cpu_count: term(),
  fully_qualified_domain_name: term(),
  host_id: term(),
  hostname: term(),
  installation_source: term(),
  ip_addresses: term(),
  last_boot_timestamp: term(),
  os_version: term(),
  prometheus_mode: term(),
  prometheus_targets: term(),
  socket_count: term(),
  systemd_units: term(),
  total_memory_mb: term(),
  version: term()
}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `legacy?`

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

# `supersede`

# `upcast`

# `upcast`

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
