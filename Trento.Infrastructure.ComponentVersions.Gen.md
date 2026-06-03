# `Trento.Infrastructure.ComponentVersions.Gen`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/component_versions/gen.ex#L4)

Behaviour for fetching component versions.

# `get_versions`

```elixir
@callback get_versions(origin :: String.t() | nil) :: %{
  wanda_version: String.t() | nil,
  checks_version: String.t() | nil,
  postgres_version: String.t() | nil,
  rabbitmq_version: String.t() | nil,
  prometheus_version: String.t() | nil
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
