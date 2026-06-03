# `Trento.Discovery.DiscardedDiscoveryEvent`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery/discarded_discovery_event.ex#L4)

This module contains the schema used to store an append log of the discarded discovery events,
for debugging and auditing purposes.
No changeset is defined here, since the schema is used to store append-only data.

# `t`

```elixir
@type t() :: %Trento.Discovery.DiscardedDiscoveryEvent{
  __meta__: term(),
  id: term(),
  inserted_at: term(),
  payload: term(),
  reason: term(),
  updated_at: term()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
