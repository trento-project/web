# `Trento.Infrastructure.SoftwareUpdates.Auth.Gen`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/software_updates/auth/gen.ex#L4)

Behaviour of the SUSE Multi-Linux Manager authentication process.

# `authenticate`

```elixir
@callback authenticate() ::
  {:ok,
   %Trento.Infrastructure.SoftwareUpdates.Auth.State{
     auth: term(),
     ca_cert: term(),
     password: term(),
     url: term(),
     username: term()
   }}
  | {:error, any()}
```

# `clear`

```elixir
@callback clear() :: :ok
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
