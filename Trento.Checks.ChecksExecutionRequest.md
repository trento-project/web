# `Trento.Checks.ChecksExecutionRequest`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/checks/checks_execution_request.ex#L4)

When the periodic checks of a host or cluster were last requested.

# `t`

```elixir
@type t() :: %Trento.Checks.ChecksExecutionRequest{
  __meta__: term(),
  inserted_at: term(),
  last_requested_at: term(),
  target_id: term(),
  target_type: term(),
  updated_at: term()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
