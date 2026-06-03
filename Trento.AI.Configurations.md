# `Trento.AI.Configurations`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/configurations.ex#L4)

This module is responsible for managing user AI configurations.

# `create_user_configuration`

```elixir
@spec create_user_configuration(Trento.Users.User.t(), map()) ::
  {:ok, Trento.AI.UserConfiguration.t()}
  | {:error, Ecto.Changeset.t()}
  | {:error, :forbidden}
```

Creates a user configuration for AI.

Only eligible users (not deleted or locked) can have an AI configuration.

# `update_user_configuration`

```elixir
@spec update_user_configuration(Trento.Users.User.t(), map()) ::
  {:ok, Trento.AI.UserConfiguration.t()}
  | {:error, Ecto.Changeset.t()}
  | {:error, :forbidden | :not_found}
```

Updates a user configuration for AI.

Only eligible users (not deleted or locked) can update their AI configuration.

If the user does not have an existing configuration, an error will be returned.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
