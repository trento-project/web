# `Trento.Settings.ApiKeySettings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/api_key_settings.ex#L4)

ApiKeySettings is the STI projection of api key related settings

# `t`

```elixir
@type t() :: %Trento.Settings.ApiKeySettings{
  __meta__: term(),
  created_at: term(),
  expire_at: term(),
  id: term(),
  inserted_at: term(),
  jti: term(),
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

---

*Consult [api-reference.md](api-reference.md) for complete listing*
