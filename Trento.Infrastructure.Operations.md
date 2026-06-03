# `Trento.Infrastructure.Operations`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/operations/operations.ex#L4)

Operations integration

# `operation_target`

```elixir
@type operation_target() :: %{agent_id: String.t(), arguments: map()}
```

# `map_operation`

# `map_operation_type`

# `request_operation`

```elixir
@spec request_operation(String.t(), String.t(), String.t(), [operation_target()]) ::
  :ok | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
