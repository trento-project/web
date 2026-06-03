# `Trento.Support.OperationsHelper`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/operations_helper.ex#L4)

Helper functions for operations

# `forbidden_error`

```elixir
@type forbidden_error() :: %{message: String.t(), metadata: [metadata()]}
```

# `metadata`

```elixir
@type metadata() :: %{
  id: Ecto.UUID.t(),
  label: String.t(),
  type: :host | :cluster | :sap_system | :database
}
```

# `build_error`

```elixir
@spec build_error(message :: String.t(), metadata :: [metadata()]) ::
  forbidden_error()
```

# `reduce_operation_authorizations`

```elixir
@spec reduce_operation_authorizations(
  authorizations :: [Enumerable.t()],
  acc :: :ok | {:error, [forbidden_error()]}
) :: :ok | {:error, [forbidden_error()]}
```

# `reduce_operation_authorizations`

```elixir
@spec reduce_operation_authorizations(
  authorizations :: [Enumerable.t()],
  acc :: :ok | {:error, [forbidden_error()]},
  func :: function()
) :: :ok | {:error, [forbidden_error()]}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
