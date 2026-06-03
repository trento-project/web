# `Trento.Settings.SSOCertificatesSettings`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/sso_certificates_settings.ex#L4)

SSOCertificatesSettings is the STI projection containing SSL certificates

# `t`

```elixir
@type t() :: %Trento.Settings.SSOCertificatesSettings{
  __meta__: term(),
  certificate_file: term(),
  id: term(),
  inserted_at: term(),
  key_file: term(),
  name: term(),
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
