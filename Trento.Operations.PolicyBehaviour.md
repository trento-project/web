# `Trento.Operations.PolicyBehaviour`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/operations/policy_behaviour.ex#L4)

Behaviour of the operations policies.

# `authorize_operation`

```elixir
@callback authorize_operation(
  operation :: atom(),
  read_model ::
    Trento.SapSystems.Projections.ApplicationInstanceReadModel.t()
    | Trento.Clusters.Projections.ClusterReadModel.t()
    | Trento.Databases.Projections.DatabaseInstanceReadModel.t()
    | Trento.Databases.Projections.DatabaseReadModel.t()
    | Trento.Hosts.Projections.HostReadModel.t()
    | Trento.SapSystems.Projections.SapSystemReadModel.t(),
  params :: map()
) :: :ok | {:error, [Trento.Support.OperationsHelper.forbidden_error()]}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
