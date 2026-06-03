# `Trento.SoftwareUpdates.Discovery.DiscoveryResult`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/software_updates/discovery/discovery_result.ex#L4)

This is the schema used to store the results of the software updates discovery process.

# `t`

```elixir
@type t() :: %Trento.SoftwareUpdates.Discovery.DiscoveryResult{
  __meta__: term(),
  failure_reason: term(),
  host_id: term(),
  inserted_at: term(),
  relevant_patches: term(),
  system_id: term(),
  updated_at: term(),
  upgradable_packages: term()
}
```

# `changeset`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
