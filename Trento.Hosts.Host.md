# `Trento.Hosts.Host`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/host.ex#L4)

The host aggregate manages all the domain logic related to individual hosts
(agent, in other term) that compose the target infrastructure running SAP systems.

Each host running a Trento agent is registered as a new aggregate entry.
New host discovery messages update the aggregate values if there is some difference.
The host aggregate stores information such as:

- Host basic information as the hostname and ip addresses
- Hardware specifications
- Platform where the host is running (the cloud provider for instance)
- Registered SLES4SAP subscriptions

Besides these mostly static values, the aggregate takes care of handling
heartbeats, checks execution result, saptune status

## Host health

Holds the information about whether the host is in an expected state or not, and if not,
what is the roout cause helping identifying possible remediation.
It is composed by sub-health elements:

- Heartbeat status
- Checks health

The main host health is computed using these values, meaning the host health is the worst of the two.

### Heartbeat

Each host in the targe SAP infrastructure running a Trento agent sends a heartbeat message and
if a heartbeat is not received within a 10 seconds period (configurable),
a heartbeat failure event is raised changing the health of the host as critical.

### Checks health

The checks health is obtained from the [Checks Engine executions](https://github.com/trento-project/wanda/).
Every time a checks execution for a host completes the execution's result is taken into account to determine host's health.
Checks execution is started either by an explicit user request or periodically as per the scheduler configuration.

### Software Updates Discovery

Business process integrating with an external service, SUSE Multi-Linux Manager, determining relevant patches and upgradable packages for a host.
Process is triggered
- on host registration
- when the fqdn of the host changes
- on host restoration
- every given amount of time
- on demand (ie the integration settings with the external service change)

Presence of relevant patches determines Software Updates Discovery health and concurs to the host's aggregated health as follows:
- critical if there is at least one security advisory
- warning if there are only buxfixes/software enhancements

The Software Updates Discovery health is computed in the integration layer
and only the resulting health is dispatched to the host aggregate along with CompleteSoftwareUpdatesDiscovery command.

# `t`

```elixir
@type t() :: %Trento.Hosts.Host{
  agent_version: term(),
  arch: term(),
  checks_health: term(),
  cpu_count: term(),
  deregistered_at: term(),
  fully_qualified_domain_name: term(),
  health: term(),
  heartbeat: term(),
  host_id: term(),
  hostname: term(),
  installation_source: term(),
  ip_addresses: term(),
  last_boot_timestamp: term(),
  os_version: term(),
  prometheus_mode: term(),
  prometheus_targets: term(),
  provider: term(),
  provider_data: term(),
  rolling_up: term(),
  saptune_health: term(),
  saptune_status: term(),
  selected_checks: term(),
  socket_count: term(),
  software_updates_discovery_health: term(),
  subscriptions: term(),
  systemd_units: term(),
  total_memory_mb: term()
}
```

# `apply`

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `execute`

# `maybe_emit_software_updates_discovery_events`

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
