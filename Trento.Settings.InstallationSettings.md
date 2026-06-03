# `Trento.Settings.InstallationSettings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/installation_settings.ex#L4)

InstallationSettings is the STI projection containing installation related settings

# `t`

```elixir
@type t() :: %Trento.Settings.InstallationSettings{
  __meta__: term(),
  id: term(),
  inserted_at: term(),
  installation_id: term(),
  type: term(),
  updated_at: term()
}
```

# `base_query`

base_query returns the complete content of the inherited table with the provided identifier

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

# `sti_changes`

# `sti_column_value`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
