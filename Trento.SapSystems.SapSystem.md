# `Trento.SapSystems.SapSystem`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/sap_system.ex#L4)

The SAP system aggregate manages all the domain logic related to
deployed SAP systems, which is composed by the application layer.

In order to have a fully registered SAP system, the database aggregate containing
this application tenant and application must be registered in the database aggregate.
The minimum set of application features is ABAP and MESSAGESERVER. Otherwise, a complete SAP system cannot exist.
This means that a SAP system aggregate state can have multiple application instances.

## SAP instance

A SAP instance can be seen as a single SAP workload installation running in a
particular host. So the instance runs entirely in one host, but on the other hand
multiple different SAP instances might be running in the same host.

For example, a ABAP and MESSAGESERVER applications.

## SAP system registration process

The SAP system registration process has some caveats, so let's see them in more details.

As a main concept, the SAP system is uniquely identified by the database ID plus application tenant.
This means that there cannot exist any SAP system without a database, so Trento agents must be running
in those hosts in order to start the registration.

That being said, this is the logical order of events in order to register a full system:

1. A database aggregate containing the tenant for this application must be already registered (check the database aggregate).
2. When a SAP system discovery with a new application instance is received, and the database associated to
   this application exists:
    - Instances that are not MESSAGESERVER or ABAP will be added without completing a SAP system registration
    - To have a fully registered SAP system, a MESSAGESERVER instance and one ABAP instance are required
3. New application instances/updates coming from already registered application instances are registered/applied.

Find additional information about the application association in `Trento.SapSystems.Commands.RegisterApplicationInstance`.

# `t`

```elixir
@type t() :: %Trento.SapSystems.SapSystem{
  database_health: term(),
  deregistered_at: term(),
  ensa_version: term(),
  health: term(),
  instances: term(),
  rolling_up: term(),
  sap_system_id: term(),
  sid: term()
}
```

# `apply`

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `execute`

# `instances_have_messageserver?`

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
