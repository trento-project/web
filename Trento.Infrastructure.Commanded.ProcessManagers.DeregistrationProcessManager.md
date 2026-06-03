# `Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/commanded/process_managers/deregistration_process_manager.ex#L4)

  DeregistrationProcessManager is a Commanded ProcessManager, it's the responsible
  for the deregistration procedure for the aggregates

  This represents a transaction to ensure that the procedure of deregistering domain aggregates
  follows a certain path and satisfies some requisites.

  For more information see https://hexdocs.pm/commanded/process-managers.html

# `t`

```elixir
@type t() ::
  %Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager{
    application_instances: term(),
    cluster_id: term(),
    database_instances: term()
  }
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `child_spec`

Provides a child specification to allow the event handler to be easily
supervised.

## Example

    Supervisor.start_link([
      {ExampleProcessManager, []}
    ], strategy: :one_for_one)

# `interested?`

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

# `start_link`

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
