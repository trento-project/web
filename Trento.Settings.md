# `Trento.Settings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings.ex#L4)

Provides a set of functions of settings related usecases.

# `alerting_setting_set_t`

```elixir
@type alerting_setting_set_t() :: %{
  enabled: boolean(),
  sender_email: String.t(),
  recipient_email: String.t(),
  smtp_server: String.t(),
  smtp_port: String.t() | integer(),
  smtp_username: String.t(),
  smtp_password: String.t()
}
```

# `alerting_setting_update_t`

```elixir
@type alerting_setting_update_t() :: %{
  optional(:enabled) =&gt; boolean(),
  optional(:sender_email) =&gt; String.t(),
  optional(:recipient_email) =&gt; String.t(),
  optional(:smtp_server) =&gt; String.t(),
  optional(:smtp_port) =&gt; String.t() | integer(),
  optional(:smtp_username) =&gt; String.t(),
  optional(:smtp_password) =&gt; String.t()
}
```

# `suse_manager_settings_change_submission`

```elixir
@type suse_manager_settings_change_submission() :: %{
  url: String.t() | nil,
  username: String.t() | nil,
  password: String.t() | nil,
  ca_cert: String.t() | nil
}
```

# `suse_manager_settings_save_submission`

```elixir
@type suse_manager_settings_save_submission() :: %{
  url: String.t(),
  username: String.t(),
  password: String.t(),
  ca_cert: String.t() | nil
}
```

# `change_activity_log_retention_period`

```elixir
@spec change_activity_log_retention_period(
  integer(),
  Trento.ActivityLog.RetentionPeriodUnit.t()
) ::
  {:ok, Trento.Settings.ActivityLogSettings.t()}
  | {:error, :activity_log_settings_not_configured}
```

# `change_suse_manager_settings`

```elixir
@spec change_suse_manager_settings(
  suse_manager_settings_change_submission(),
  module()
) ::
  {:ok, Trento.Settings.SuseManagerSettings.t()}
  | {:error, :settings_not_configured}
  | {:error, any()}
```

# `clear_suse_manager_settings`

```elixir
@spec clear_suse_manager_settings() :: :ok
```

# `create_alerting_settings`

```elixir
@spec create_alerting_settings(alerting_setting_set_t()) ::
  {:ok, Trento.Settings.AlertingSettings.t()}
  | {:error, :alerting_settings_enforced}
  | {:error, Ecto.Changeset.t()}
```

# `create_api_key_settings`

```elixir
@spec create_api_key_settings(map()) ::
  {:ok, Trento.Settings.ApiKeySettings.t()} | {:error, any()}
```

# `get_activity_log_settings`

```elixir
@spec get_activity_log_settings() ::
  {:ok, Trento.Settings.ActivityLogSettings.t()}
  | {:error, :activity_log_settings_not_configured}
```

# `get_alerting_settings`

```elixir
@spec get_alerting_settings() ::
  {:ok, Trento.Settings.AlertingSettings.t()}
  | {:error, :alerting_settings_not_configured}
```

# `get_api_key_settings`

```elixir
@spec get_api_key_settings() ::
  {:ok, Trento.Settings.ApiKeySettings.t()} | {:error, any()}
```

# `get_installation_id`

```elixir
@spec get_installation_id() :: String.t()
```

# `get_sso_certificates`

```elixir
@spec get_sso_certificates() :: [Trento.Settings.SSOCertificatesSettings.t()]
```

# `get_suse_manager_settings`

```elixir
@spec get_suse_manager_settings() ::
  {:ok, Trento.Settings.SuseManagerSettings.t()}
  | {:error, :settings_not_configured}
```

# `save_suse_manager_settings`

```elixir
@spec save_suse_manager_settings(suse_manager_settings_save_submission(), module()) ::
  {:ok, Trento.Settings.SuseManagerSettings.t()}
  | {:error, :settings_already_configured}
  | {:error, any()}
```

# `update_alerting_settings`

```elixir
@spec update_alerting_settings(alerting_setting_update_t()) ::
  {:ok, Trento.Settings.AlertingSettings.t()}
  | {:error, :alerting_settings_enforced}
  | {:error, :alerting_settings_not_configured}
  | {:error, Ecto.Changeset.t()}
```

# `update_api_key_settings`

```elixir
@spec update_api_key_settings(DateTime.t()) ::
  {:ok, Trento.Settings.ApiKeySettings.t()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
