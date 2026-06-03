# `Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/software_updates/adapter/suma_http_executor.ex#L4)

SUSE Multi-Linux Manager Http requests executor

# `get_affected_packages`

```elixir
@callback get_affected_packages(
  base_url :: String.t(),
  auth :: String.t(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_affected_systems`

```elixir
@callback get_affected_systems(
  base_url :: String.t(),
  auth :: String.t(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_bugzilla_fixes`

```elixir
@callback get_bugzilla_fixes(
  base_url :: String.t(),
  auth :: String.t(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_cves`

```elixir
@callback get_cves(
  base_url :: String.t(),
  auth :: String.t(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_errata_details`

```elixir
@callback get_errata_details(
  base_url :: String.t(),
  auth :: String.t(),
  advisory_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_patches_for_package`

```elixir
@callback get_patches_for_package(
  base_url :: String.t(),
  auth :: String.t(),
  package_id :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_relevant_patches`

```elixir
@callback get_relevant_patches(
  base_url :: String.t(),
  auth :: String.t(),
  system_id :: pos_integer(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_system_id`

```elixir
@callback get_system_id(
  base_url :: String.t(),
  auth :: String.t(),
  fully_qualified_domain_name :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_upgradable_packages`

```elixir
@callback get_upgradable_packages(
  base_url :: String.t(),
  auth :: String.t(),
  system_id :: pos_integer(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `login`

```elixir
@callback login(
  base_url :: String.t(),
  username :: String.t(),
  password :: String.t(),
  ca_cert :: String.t() | nil
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `get_cert_der`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
