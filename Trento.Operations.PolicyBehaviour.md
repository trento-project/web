# `Trento.Operations.PolicyBehaviour`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/operations/policy_behaviour.ex#L4)

Behaviour of the operations policies.

# `authorize_operation`

```elixir
@callback authorize_operation(
  operation :: atom(),
  read_model :: struct(),
  params :: map()
) ::
  :ok | {:error, [Trento.Support.OperationsHelper.forbidden_error()]}
```

# `metadata`

```elixir
@callback metadata(read_model :: struct()) :: Trento.Support.OperationsHelper.metadata()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
