# `Trento.Support.HttpClient`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/http_client.ex#L4)

Shared HTTP client behaviour wrapping `HTTPoison`. The default implementation
forwards to HTTPoison and injects secure SSL defaults (`verify_peer` with the
system CA bundle); callers can override individual SSL keys by passing their
own `:ssl` keyword. Tests substitute a Mox mock via config.

# `get`

```elixir
@callback get(url :: String.t(), headers :: list(), options :: keyword()) ::
  {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

# `request`

```elixir
@callback request(
  verb :: atom(),
  url :: String.t(),
  body :: binary(),
  headers :: list(),
  options :: keyword()
) :: {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
