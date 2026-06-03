# `Trento.Hosts.Projections.SlesSubscriptionReadModel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/projections/sles_subscription_read_model.ex#L4)

SLES subscriptions read model

# `t`

```elixir
@type t() :: %Trento.Hosts.Projections.SlesSubscriptionReadModel{
  __meta__: term(),
  arch: term(),
  expires_at: term(),
  host_id: term(),
  identifier: term(),
  inserted_at: term(),
  starts_at: term(),
  status: term(),
  subscription_status: term(),
  type: term(),
  updated_at: term(),
  version: term()
}
```

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
