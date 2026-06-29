# `Trento.Discovery.Payloads.SapSystemDiscoveryPayload.SapControlInstance`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery/payloads/sap_system_discovery_payload.ex#L243)

SAP control instances field payload

# `t`

```elixir
@type t() :: %Trento.Discovery.Payloads.SapSystemDiscoveryPayload.SapControlInstance{
  currentInstance: term(),
  dispstatus: term(),
  features: term(),
  hostname: term(),
  httpPort: term(),
  httpsPort: term(),
  instanceNr: term(),
  startPriority: term()
}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `changeset`

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
