# `TrentoWeb.Auth.AssentSamlStrategy`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/auth/assent_saml_strategy.ex#L4)

Assent strategy to handle SAML authentication

# `authorize_url`

```elixir
@spec authorize_url(Keyword.t()) :: {:ok, %{url: binary()}} | {:error, term()}
```

# `callback`

```elixir
@spec callback(Keyword.t(), map()) ::
  {:ok, %{user: map(), token: map()}} | {:error, term()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
