# `TrentoWeb.Plugs.LoadUserPlug`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/plugs/load_user_plug.ex#L4)

LoadUserPlug loads the stateless user from jwt from the database.
The current user is replaced with the stateful user for subsequent plugs

# `call`

```elixir
@spec call(Plug.Conn.t(), any()) :: Plug.Conn.t()
```

# `init`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
