# `Trento.Discovery.DiscoveryEvent`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery/discovery_event.ex#L4)

This module contains the schema used to store an append log of the handled discovery events,
for debugging and auditing purposes.
No changeset is defined here, since the schema is used to store append-only data.

# `t`

```elixir
@type t() :: %Trento.Discovery.DiscoveryEvent{
  __meta__: term(),
  agent_id: term(),
  discovery_type: term(),
  id: term(),
  inserted_at: term(),
  payload: term(),
  updated_at: term()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
