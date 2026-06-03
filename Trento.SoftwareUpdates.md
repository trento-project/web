# `Trento.SoftwareUpdates`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/software_updates.ex#L4)

Entry point for the software updates feature.

# `get_packages_patches`

```elixir
@spec get_packages_patches([String.t()]) ::
  {:ok, [map()]}
  | {:error,
     :settings_not_configured
     | :error_getting_patches
     | :error_getting_affected_packages
     | :max_login_retries_reached}
```

# `get_software_updates`

```elixir
@spec get_software_updates(Ecto.UUID.t()) ::
  {:ok, map()}
  | {:error,
     :settings_not_configured
     | :not_found
     | :system_id_not_found
     | :error_getting_patches
     | :error_getting_packages
     | :max_login_retries_reached}
```

# `run_discovery`

```elixir
@spec run_discovery() :: :ok | {:error, :settings_not_configured}
```

# `test_connection_settings`

```elixir
@spec test_connection_settings() :: :ok | {:error, :connection_test_failed}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
