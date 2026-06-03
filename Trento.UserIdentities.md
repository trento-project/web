# `Trento.UserIdentities`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/user_identities.ex#L4)

The UserIdentities context, serves as custom context for PowAssent

# `all`

# `create`

> This function is deprecated. Please use `upsert/2` instead.

# `create_user`

redefining the PowAssent create user method, this is called when the user login through idp and a user identity
does not exists on our database.

If a user with the same username exists on our database, the user will be recovered and associated with the idp identity,
otherwise the user will be created.

# `delete`

# `get_user_by_provider_uid`

# `pow_assent_all`

# `pow_assent_create`

> This function is deprecated. Please use `pow_assent_upsert/2` instead.

# `pow_assent_create_user`

# `pow_assent_delete`

# `pow_assent_get_user_by_provider_uid`

# `pow_assent_upsert`

# `upsert`

redefining the PowAssent upsert method, if a IDP user is associated with a locked user,
this is called when the user login with IDP and exist in our database with or without a user identity

---

*Consult [api-reference.md](api-reference.md) for complete listing*
