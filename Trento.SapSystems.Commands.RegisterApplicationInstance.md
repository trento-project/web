# `Trento.SapSystems.Commands.RegisterApplicationInstance`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/commands/register_application_instance.ex#L4)

Register an application instance to the monitoring system.

In order to register an application instance a database entry associated to this application
must be already registered.

The database/application association consists of having:
- the application instance `tenant` field matching with an already registered database instance `tenant`
- the application `db_host` field matching with one of the IP addresses of the host where this database is running

Find the association protocol code [here](https://github.com/trento-project/web/blob/main/lib/trento/application/integration/discovery/protocol/enrich_register_application_instance.ex)
as reference.

cluster_id value is used to know if the application instance is clustered or not.
This information is required in order to decide whether the instance was moved by the cluster in a failover scenario or not

# `t`

```elixir
@type t() :: %Trento.SapSystems.Commands.RegisterApplicationInstance{
  clustered: term(),
  database_health: term(),
  database_id: term(),
  db_host: term(),
  ensa_version: term(),
  features: term(),
  health: term(),
  host_id: term(),
  http_port: term(),
  https_port: term(),
  instance_hostname: term(),
  instance_number: term(),
  sap_system_id: term(),
  sid: term(),
  start_priority: term(),
  tenant: term()
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
