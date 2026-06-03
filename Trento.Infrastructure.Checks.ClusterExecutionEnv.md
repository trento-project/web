# `Trento.Infrastructure.Checks.ClusterExecutionEnv`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/checks/cluster_execution_env.ex#L4)

Cluster checks execution env map

# `t`

```elixir
@type t() :: %Trento.Infrastructure.Checks.ClusterExecutionEnv{
  architecture_type: term(),
  cluster_type: term(),
  ensa_version: term(),
  filesystem_type: term(),
  hana_scenario: term(),
  provider: term()
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
