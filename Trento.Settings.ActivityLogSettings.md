# `Trento.Settings.ActivityLogSettings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/activity_log_settings.ex#L4)

ActivityLogSettings is the STI projection of activity log related settings

# `t`

```elixir
@type t() :: %Trento.Settings.ActivityLogSettings{
  __meta__: term(),
  id: term(),
  inserted_at: term(),
  retention_time: term(),
  type: term(),
  updated_at: term()
}
```

# `authorize`

# `base_query`

base_query returns the complete content of the inherited table with the provided identifier

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

# `sti_changes`

# `sti_column_value`

# `with_default_retention_time`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
