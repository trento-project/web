# `Trento.Discovery.Policies.SapSystemPolicy`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery/policies/sap_system_policy.ex#L4)

This module contains functions to transform SAP system related integration events into commands..

# `handle`

```elixir
@spec handle(
  map(),
  [
    Trento.SapSystems.Projections.ApplicationInstanceReadModel.t()
    | Trento.Databases.Projections.DatabaseInstanceReadModel.t()
  ],
  [Trento.Clusters.ValueObjects.SapInstance.t()]
) ::
  {:ok,
   [
     Trento.SapSystems.Commands.RegisterApplicationInstance.t()
     | Trento.Databases.Commands.RegisterDatabaseInstance.t()
   ]}
  | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
