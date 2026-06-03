# `Trento.Infrastructure.Prometheus.ChartIntegration`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/prometheus/chart_integration.ex#L4)

ChartIntegration provides a mechanism for mapping prometheus query information to domain
Chart time series objects

# `matrix_results_to_samples`

```elixir
@spec matrix_results_to_samples([map()]) ::
  {:ok, [Trento.Charts.ChartTimeSeriesSample.t()]} | {:error, any()}
```

# `vector_results_to_samples`

```elixir
@spec vector_results_to_samples([map()]) ::
  {:ok, [%{metric: map(), sample: Trento.Charts.ChartTimeSeriesSample.t()}]}
  | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
