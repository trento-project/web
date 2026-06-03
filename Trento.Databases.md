# `Trento.Databases`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases.ex#L4)

Provides a set of functions to interact with databases.

# `by_id`

```elixir
@spec by_id(String.t()) ::
  {:ok, Trento.Databases.Projections.DatabaseReadModel.t()}
  | {:error, :not_found}
```

# `deregister_database_instance`

```elixir
@spec deregister_database_instance(
  Ecto.UUID.t(),
  Ecto.UUID.t(),
  String.t(),
  Trento.Support.DateService
) ::
  :ok
  | {:error, :instance_present}
  | {:error, :database_instance_not_registered}
```

# `get_all_databases`

```elixir
@spec get_all_databases() :: [Trento.Databases.Projections.DatabaseReadModel.t()]
```

# `get_database_by_id`

```elixir
@spec get_database_by_id(String.t()) ::
  Trento.Databases.Projections.DatabaseReadModel.t() | nil
```

# `get_database_instances_by_host_id`

```elixir
@spec get_database_instances_by_host_id(String.t()) :: [
  Trento.Databases.Projections.DatabaseInstanceReadModel.t()
]
```

# `get_database_instances_by_id`

```elixir
@spec get_database_instances_by_id(String.t()) :: [
  Trento.Databases.Projections.DatabaseInstanceReadModel.t()
]
```

# `request_operation`

```elixir
@spec request_operation(atom(), Ecto.UUID.t(), map()) ::
  {:ok, String.t()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
