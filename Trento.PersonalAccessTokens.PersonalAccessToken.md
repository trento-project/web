# `Trento.PersonalAccessTokens.PersonalAccessToken`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/personal_access_tokens/personal_access_token.ex#L4)

Represents a Personal Access Token for a user.

# `t`

```elixir
@type t() :: %Trento.PersonalAccessTokens.PersonalAccessToken{
  __meta__: term(),
  created_at: term(),
  expires_at: term(),
  hashed_token: term(),
  id: term(),
  name: term(),
  token: term(),
  updated_at: term(),
  user: term(),
  user_id: term()
}
```

# `changeset`

# `hash_token`

```elixir
@spec hash_token(String.t() | nil) :: String.t() | nil
```

Generates a SHA-512 hash of the given token.
Returns nil if the input token is nil.

Argon2 does not fit well for this use case because:
  1. Every Argon2.hash_pwd_salt(token) call generates a different hash even for the same input token.
     This is due to the random salt used internally by Argon2, so that it becomes impossible to query the database for a given token hash.
  2. In order to run a Argon2.verify_pass(plain_pat, hashed_pat) we would need to query the hashed_pat first. But unless we rely on other information we cannot get that.
  3. We need the hashing to be fast since it will possibly happen on a lot of interactions with the system.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
