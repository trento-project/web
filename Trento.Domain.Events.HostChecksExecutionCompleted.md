# `Trento.Domain.Events.HostChecksExecutionCompleted`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/events/legacy/host_checks_execution_completed.ex#L4)

Event of the checks execution completed of a host.

# `t`

```elixir
@type t() :: %Trento.Domain.Events.HostChecksExecutionCompleted{
  checks_results: term(),
  cluster_id: term(),
  host_id: term(),
  msg: term(),
  reachable: term(),
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
