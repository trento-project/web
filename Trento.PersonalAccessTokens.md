# `Trento.PersonalAccessTokens`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/personal_access_tokens.ex#L4)

Context for managing user personal access tokens.

# `create_personal_access_token`

```elixir
@spec create_personal_access_token(Trento.Users.User.t(), map()) ::
  {:ok, Trento.PersonalAccessTokens.PersonalAccessToken.t()}
  | {:error, Ecto.Changeset.t()}
  | {:error, :forbidden}
```

# `revoke_personal_access_token`

```elixir
@spec revoke_personal_access_token(Trento.Users.User.t(), bitstring()) ::
  {:ok, Trento.PersonalAccessTokens.PersonalAccessToken.t()}
  | {:error, :not_found | any()}
```

# `validate`

```elixir
@spec validate(bitstring()) ::
  {:ok, Trento.PersonalAccessTokens.PersonalAccessToken.t()}
  | {:error, :invalid_pat}
```

# `validate_and_introspect`

```elixir
@spec validate_and_introspect(bitstring()) ::
  {:ok, Trento.PersonalAccessTokens.PersonalAccessToken.t()}
  | {:error, :invalid_pat}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
