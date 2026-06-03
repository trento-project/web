# `Trento.Hosts.Commands.RegisterHost`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/commands/register_host.ex#L4)

Register a host to the monitoring system.

# `t`

```elixir
@type t() :: %Trento.Hosts.Commands.RegisterHost{
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
  total_memory_mb: term()
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
