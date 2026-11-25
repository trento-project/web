# `Trento.Services.HealthService`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/services/health_service.ex#L4)

This module contains the domain logic for health computation and status conversions.

# `compute_aggregated_health`

```elixir
@spec compute_aggregated_health([Trento.Enums.Health.t()]) :: Trento.Enums.Health.t()
```

# `compute_instances_health`

```elixir
@spec compute_instances_health([%{status: Trento.SapSystems.Enums.Status.t()}]) ::
  Trento.Enums.Health.t()
```

# `derive_health_from_status`

```elixir
@spec derive_health_from_status(Trento.SapSystems.Enums.Status.t()) ::
  Trento.Enums.Health.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
