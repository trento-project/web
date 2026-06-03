# `Trento.Users`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/users.ex#L4)

The Users context.

# `authenticate`

# `by_id`

```elixir
@spec by_id(id :: non_neg_integer()) ::
  {:ok, Trento.Users.User.t()} | {:error, :not_found}
```

# `confirm_totp_enrollment`

# `create`

# `create_user`

# `delete`

# `delete_user`

# `get_by`

get_by function overrides the one defined in Pow.Ecto.Context,
we retrieve the user by username as traditional Pow flow but we also exclude
deleted and locked users

# `get_user`

# `initiate_totp_enrollment`

# `list_users`

# `maybe_disable_totp`

# `pow_authenticate`

# `pow_create`

# `pow_delete`

# `pow_get_by`

# `pow_update`

# `reset_totp`

# `update`

# `update_last_login_at`

# `update_user`

# `update_user_profile`

# `update_user_profile_sso_enabled`

# `validate_totp`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
