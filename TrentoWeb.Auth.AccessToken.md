# `TrentoWeb.Auth.AccessToken`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/auth/access_token.ex#L4)

  Jwt Token is the module responsible for creating a proper jwt access token.

  Uses Joken as jwt base library

# `aud`

```elixir
@spec aud() :: String.t()
```

# `expires_in`

```elixir
@spec expires_in() :: integer()
```

  Returns the access_token expiration time, in seconds

# `generate_access_token!`

```elixir
@spec generate_access_token!(map()) :: binary()
```

  Generates and sign a valid access token with the default claims
  for the token type

  Raise an error

# `generate_and_sign`

```elixir
@spec generate_and_sign(Joken.claims(), Joken.signer_arg()) ::
  {:ok, Joken.bearer_token(), Joken.claims()} | {:error, Joken.error_reason()}
```

Combines `generate_claims/1` and `encode_and_sign/2`

# `generate_and_sign!`

```elixir
@spec generate_and_sign!(Joken.claims(), Joken.signer_arg()) :: Joken.bearer_token()
```

Same as `generate_and_sign/2` but raises if error

# `verify_and_validate`

```elixir
@spec verify_and_validate(Joken.bearer_token(), Joken.signer_arg(), term()) ::
  {:ok, Joken.claims()} | {:error, Joken.error_reason()}
```

Combines `verify/2` and `validate/2`

# `verify_and_validate!`

```elixir
@spec verify_and_validate!(Joken.bearer_token(), Joken.signer_arg(), term()) ::
  Joken.claims()
```

Same as `verify_and_validate/2` but raises if error

---

*Consult [api-reference.md](api-reference.md) for complete listing*
