# `Trento.SapSystems`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems.ex#L4)

Provides a set of functions to interact with SAP systems.

# `by_id`

```elixir
@spec by_id(String.t()) ::
  {:ok, Trento.SapSystems.Projections.SapSystemReadModel.t()}
  | {:error, :not_found}
```

# `deregister_application_instance`

```elixir
@spec deregister_application_instance(
  Ecto.UUID.t(),
  Ecto.UUID.t(),
  String.t(),
  Trento.Support.DateService
) ::
  :ok
  | {:error, :instance_present}
  | {:error, :application_instance_not_registered}
```

# `get_all_sap_systems`

```elixir
@spec get_all_sap_systems() :: [Trento.SapSystems.Projections.SapSystemReadModel.t()]
```

# `get_application_instances_by_host_id`

```elixir
@spec get_application_instances_by_host_id(String.t()) :: [
  Trento.SapSystems.Projections.ApplicationInstanceReadModel.t()
]
```

# `get_application_instances_by_id`

```elixir
@spec get_application_instances_by_id(String.t()) :: [
  Trento.SapSystems.Projections.ApplicationInstanceReadModel.t()
]
```

# `get_sap_system_by_id`

```elixir
@spec get_sap_system_by_id(String.t()) ::
  Trento.SapSystems.Projections.SapSystemReadModel.t() | nil
```

# `request_instance_operation`

```elixir
@spec request_instance_operation(atom(), Ecto.UUID.t(), String.t(), map()) ::
  {:ok, String.t()} | {:error, any()}
```

# `request_operation`

```elixir
@spec request_operation(atom(), Ecto.UUID.t(), map()) ::
  {:ok, String.t()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
