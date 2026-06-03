# `Trento.Infrastructure.Prometheus.Adapter.HttpClient`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/prometheus/adapter/http_client.ex#L4)

HTTP client behaviour for Prometheus API calls.

# `get`

```elixir
@callback get(
  url :: String.t(),
  headers :: HTTPoison.Request.headers(),
  options :: keyword()
) ::
  {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
