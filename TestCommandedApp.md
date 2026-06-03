# `TestCommandedApp`
[🔗](https://github.com/trento-project/web/blob/main/test/support/commanded/test_commanded_app.ex#L4)

InMemory commanded app used in tests.

# `aggregate_state`

```elixir
@spec aggregate_state(
  aggregate_module :: module(),
  aggregate_uuid :: Commanded.Aggregates.Aggregate.uuid(),
  timeout :: integer()
) :: Commanded.Aggregates.Aggregate.state()
```

Retrieve aggregate state of an aggregate.

Retrieving aggregate state is done by calling to the opened aggregate,
or querying the event store for an optional state snapshot
and then replaying the aggregate's event stream.

# `child_spec`

```elixir
@spec child_spec(opts :: Commanded.Application.options()) :: Supervisor.child_spec()
```

# `config`

# `dispatch`

```elixir
@spec dispatch(
  command :: struct(),
  timeout_or_opts :: non_neg_integer() | :infinity | Keyword.t()
) ::
  Commanded.Commands.Router.dispatch_resp()
```

Dispatch a registered command.

# `start_link`

# `stop`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
