# `TrentoWeb.Auth.Tokens`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/auth/tokens.ex#L4)

Module responsible to deal with tokens concerns like introspection and validation.

# `access_token_expires_in`

# `generate_access_token!`

# `generate_refresh_token!`

# `introspect`

```elixir
@spec introspect(binary()) :: map()
```

Introspects and validates a given token (might or might not be a JWT).

## Parameters
  - token: The token to be introspected. It can be a JWT access token or a Personal Access Token (PAT).

## Returns
  - claims: always a map of claims. If the token is invalid, the map contains only the "active" claim set to false.

# `verify_and_validate`

```elixir
@spec verify_and_validate(binary()) :: {:ok, map()} | {:error, atom()}
```

Verifies and validates a given token (might or might not be a JWT).

## Parameters
  - token: The token to be verified. It can be a JWT access token or a Personal Access Token (PAT).

## Returns
  - {:ok, claims} if the token is valid.
  - {:error, reason} if the token is invalid, expired, revoked or, in case of PATs, belongs to a deleted/disabled user.

# `verify_and_validate_refresh_token`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
