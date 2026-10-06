# `Trento.Infrastructure.SoftwareUpdates.SmlmApi`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/software_updates/smlm_api.ex#L4)

SUSE Multi-Linux Manager API client supporting software updates discovery.

# `get_affected_packages`

```elixir
@spec get_affected_packages(
  url :: String.t(),
  auth :: any(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]}
  | {:error, :error_getting_affected_packages | :smlm_authentication_error}
```

# `get_affected_systems`

```elixir
@spec get_affected_systems(
  url :: String.t(),
  auth :: any(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]}
  | {:error, :error_getting_affected_systems | :smlm_authentication_error}
```

# `get_bugzilla_fixes`

```elixir
@spec get_bugzilla_fixes(
  url :: String.t(),
  auth :: any(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]} | {:error, :error_getting_fixes | :smlm_authentication_error}
```

# `get_cves`

```elixir
@spec get_cves(
  url :: String.t(),
  auth :: any(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, [map()]} | {:error, :error_getting_cves | :smlm_authentication_error}
```

# `get_errata_details`

```elixir
@spec get_errata_details(
  url :: String.t(),
  auth :: any(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]}
  | {:error, :error_getting_errata_details | :smlm_authentication_error}
```

# `get_patches_for_package`

```elixir
@spec get_patches_for_package(
  url :: String.t(),
  auth :: any(),
  package_id :: String.t(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]} | {:error, :error_getting_patches | :smlm_authentication_error}
```

# `get_relevant_patches`

```elixir
@spec get_relevant_patches(
  url :: String.t(),
  auth :: any(),
  system_id :: pos_integer(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]} | {:error, :error_getting_patches | :smlm_authentication_error}
```

# `get_system_id`

```elixir
@spec get_system_id(
  url :: String.t(),
  auth :: any(),
  fully_qualified_domain_name :: String.t(),
  ca_cert :: String.t() | nil
) ::
  {:ok, pos_integer()}
  | {:error, :system_id_not_found | :smlm_authentication_error}
```

# `get_upgradable_packages`

```elixir
@spec get_upgradable_packages(
  url :: String.t(),
  auth :: any(),
  system_id :: pos_integer(),
  ca_cert :: String.t() | nil
) ::
  {:ok, [map()]}
  | {:error, :error_getting_packages | :smlm_authentication_error}
```

# `login`

```elixir
@spec login(
  url :: String.t(),
  username :: String.t(),
  password :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, any()} | {:error, :max_login_retries_reached | any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
