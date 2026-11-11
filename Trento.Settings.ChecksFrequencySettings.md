# `Trento.Settings.ChecksFrequencySettings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/checks_frequency_settings.ex#L4)

ChecksFrequencySettings is the STI projection of the global checks frequency.

When `enabled` is false the checks do not run periodically. The frequency stays saved, so
enabling the checks again restores it.

# `t`

```elixir
@type t() :: %Trento.Settings.ChecksFrequencySettings{
  __meta__: term(),
  enabled: term(),
  enforced_from_env: term(),
  frequency: term(),
  id: term(),
  inserted_at: term(),
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
