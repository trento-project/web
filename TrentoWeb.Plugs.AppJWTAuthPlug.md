# `TrentoWeb.Plugs.AppJWTAuthPlug`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/plugs/app_jwt_auth_plug.ex#L4)

  The AppJWTAuthPlug is a Pow compatible authorization flow.
  Handles the login and the credentials recovery at each request

  Uses Joken for jwt management

  See the pow documentation for further details.
  https://hexdocs.pm/pow/Pow.Plug.Base.html

# `call`

Configures the connection for Pow, and fetches user.

If no options have been passed to the plug, the existing configuration
will be pulled with `Pow.Plug.fetch_config/1`

`:plug` is appended to the passed configuration, so the current plug will
be used in any subsequent calls to create, update and delete user
credentials from the connection. The configuration is then set for the
conn with `Pow.Plug.put_config/2`.

If a user can't be fetched with `Pow.Plug.current_user/2`, `do_fetch/2`
will be called.

# `create`

  Generates the refresh and access token pairs from a User
  The generated credentials will be stored in private section of the Plug.Conn struct

# `delete`

  The authentication method is stateles, this is a no-op. Need that to satisfy Pow library

# `do_create`

Calls `create/3` and assigns the current user.

The user is assigned to the conn with `Pow.Plug.assign_current_user/3`.

# `do_delete`

Calls `delete/2` and removes the current user assigned to the conn.

The user assigned is removed from the conn with
`Pow.Plug.assign_current_user/3`.

# `do_fetch`

Calls `fetch/2` and assigns the current user to the conn.

The user is assigned to the conn with `Pow.Plug.assign_current_user/3`.

# `fetch`

  Read, validate and decode the JWT from authorization header at each call

# `renew`

```elixir
@spec renew(Plug.Conn.t(), String.t()) :: {:ok, Plug.Conn.t()} | {:error, any()}
```

Creates new tokens using the refresh token.

The refresh token should be verified and valid, a new access token will be issued
with the same validity as other access tokens, for the sub of the refresh token.

Deleted and locked users, are not allowed to generate a refresh token.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
