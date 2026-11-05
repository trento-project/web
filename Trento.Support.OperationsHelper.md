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

# `do_bulk_requests`

```elixir
@spec do_bulk_requests(
  resource_ids :: [String.t()],
  request_func :: (String.t() -&gt; {:ok, String.t()} | {:error, any()})
) ::
  {:ok, String.t(), [%{resource_id: String.t(), operation_id: String.t()}],
   [%{resource_id: String.t(), reason: any()}]}
  | {:error, :bulk_operation_request_failed}
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

# `to_bulk_operation`

```elixir
@spec to_bulk_operation(operation :: [atom()] | atom()) :: [atom()] | atom()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
