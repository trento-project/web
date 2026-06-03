# `TrentoWeb.Auth.ApiKey`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/auth/api_key.ex#L4)

ApiKey is the module responsible for creating a proper jwt api token used for accessing the api token protected resource.
The token uses the same signer as app access token
Uses Joken as jwt base library

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

# `generate_api_key!`

```elixir
@spec generate_api_key!(map(), DateTime.t(), DateTime.t() | nil) :: String.t()
```

  Generates and sign a valid api key with given claims and expiration.
   
  Expiration set to infinite when nil
  Raise an error

# `prepare_claims`

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
