# `Trento.Settings.Policy`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/settings/policy.ex#L4)

Policy for the Settings resource

User with the ability all:all can perform all actions
User with the ability all:api_key_settings can generate a new api key.
User with the ability all:activity_logs_settings can change activity logs settings.

# `authorize`

# `get_resource`

```elixir
@spec get_resource(atom()) :: atom() | nil
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
