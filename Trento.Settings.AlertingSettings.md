# `Trento.Settings.AlertingSettings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/alerting_settings.ex#L4)

Schema and functions related to alerting settings.

# `t`

```elixir
@type t() :: %Trento.Settings.AlertingSettings{
  __meta__: term(),
  enabled: term(),
  enforced_from_env: term(),
  id: term(),
  inserted_at: term(),
  recipient_email: term(),
  sender_email: term(),
  smtp_password: term(),
  smtp_port: term(),
  smtp_server: term(),
  smtp_username: term(),
  type: term(),
  updated_at: term()
}
```

# `base_query`

base_query returns the complete content of the inherited table with the provided identifier

# `changeset`

```elixir
@spec changeset(t(), map()) :: Ecto.Changeset.t()
```

# `sti_changes`

# `sti_column_value`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
