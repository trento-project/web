# `Trento.Infrastructure.Checks`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/checks/checks.ex#L4)

Checks Engine service integration

# `target_env`

```elixir
@type target_env() ::
  Trento.Infrastructure.Checks.HostExecutionEnv.t()
  | Trento.Infrastructure.Checks.ClusterExecutionEnv.t()
```

# `target_type`

```elixir
@type target_type() :: Trento.Infrastructure.Checks.TargetType.t()
```

# `targets`

```elixir
@type targets() :: [%{host_id: String.t()}]
```

# `complete_execution`

```elixir
@spec complete_execution(
  String.t(),
  String.t(),
  Trento.Enums.Health.t(),
  target_type()
) ::
  :ok | {:error, any()}
```

# `request_execution`

```elixir
@spec request_execution(
  String.t(),
  String.t(),
  target_env(),
  targets(),
  [String.t()],
  target_type()
) :: :ok | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
