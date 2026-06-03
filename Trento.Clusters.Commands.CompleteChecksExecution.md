# `Trento.Clusters.Commands.CompleteChecksExecution`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/commands/complete_checks_execution.ex#L4)

Complete the checks execution with the incoming result

# `t`

```elixir
@type t() :: %Trento.Clusters.Commands.CompleteChecksExecution{
  cluster_id: term(),
  health: term()
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
