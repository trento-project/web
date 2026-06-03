# `Trento.SoftwareUpdates.Discovery.Gen`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/software_updates/discovery/gen.ex#L4)

Behaviour of the software updates discovery process.

# `clear`

```elixir
@callback clear() :: :ok
```

# `get_affected_packages`

```elixir
@callback get_affected_packages(advisory_name :: String.t()) ::
  {:ok, [map()]} | {:error, any()}
```

# `get_affected_systems`

```elixir
@callback get_affected_systems(advisory_name :: String.t()) ::
  {:ok, [map()]} | {:error, any()}
```

# `get_bugzilla_fixes`

```elixir
@callback get_bugzilla_fixes(advisory_name :: String.t()) ::
  {:ok, map()} | {:error, any()}
```

# `get_cves`

```elixir
@callback get_cves(advisory_name :: String.t()) :: {:ok, [String.t()]} | {:error, any()}
```

# `get_errata_details`

```elixir
@callback get_errata_details(advisory_name :: String.t()) ::
  {:ok, map()} | {:error, any()}
```

# `get_patches_for_package`

```elixir
@callback get_patches_for_package(package_id :: String.t()) ::
  {:ok, [map()]} | {:error, any()}
```

# `get_relevant_patches`

```elixir
@callback get_relevant_patches(system_id :: pos_integer()) ::
  {:ok, [map()]} | {:error, any()}
```

# `get_system_id`

```elixir
@callback get_system_id(fully_qualified_domain_name :: String.t()) ::
  {:ok, pos_integer()} | {:error, any()}
```

# `get_upgradable_packages`

```elixir
@callback get_upgradable_packages(system_id :: pos_integer()) ::
  {:ok, [map()]} | {:error, any()}
```

# `setup`

```elixir
@callback setup() :: :ok | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
