# `Trento.Infrastructure.Prometheus.PromQL`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/prometheus/promql.ex#L4)

PromQL query manipulation utilities.

Provides functions to inject labels into PromQL expressions using a
character-level scanner, without relying on regex.

# `inject_label`

```elixir
@spec inject_label(String.t(), String.t(), String.t()) :: String.t()
```

Injects a label into a PromQL query, scoping all vector selectors.

Strips any existing matcher for the given label name first, then injects
`label_name="label_value"` into all vector selectors. Uses a character-level
scanner for robustness.

## Examples

    iex> Trento.Infrastructure.Prometheus.PromQL.inject_label("up", "agentID", "host-123")
    "up{agentID=\"host-123\"}"

    iex> Trento.Infrastructure.Prometheus.PromQL.inject_label("up{job=\"node\"}", "agentID", "host-123")
    "up{agentID=\"host-123\",job=\"node\"}"

---

*Consult [api-reference.md](api-reference.md) for complete listing*
