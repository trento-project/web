# `Trento.Discovery.Policies.HostPolicy`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery/policies/host_policy.ex#L4)

This module contains functions to transform host related integration events into commands.

# `handle`

```elixir
@spec handle(map()) ::
  {:ok,
   Trento.Hosts.Commands.RegisterHost.t()
   | Trento.Hosts.Commands.UpdateProvider.t()
   | Trento.Hosts.Commands.UpdateSlesSubscriptions.t()}
  | {:error, any()}
```

# `handle`

```elixir
@spec handle(map(), boolean()) ::
  {:ok, Trento.Hosts.Commands.UpdateSaptuneStatus.t()} | {:error, any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
