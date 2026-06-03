# `Trento.Abilities.UsersAbilities`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/abilities/users_abilities.ex#L4)

Many to many table schema used to connect users and abilities.

We have a dedicated schema to implement the association between users and abilities,
to just enable read only operation.
Using the default ecto schema, declaring a user with a not existing ability would trigger the creation of this second,
and we don't want to allow that. Abilities are just read only.

# `changeset`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
