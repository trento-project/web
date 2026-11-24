# `Trento.Checks`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/checks.ex#L4)

Periodic checks executions of the hosts and clusters.

# `request_due_executions`

```elixir
@spec request_due_executions(:host | :cluster, module()) :: :ok
```

Requests a checks execution for the registered hosts, or checkable clusters, with selected
checks that were never requested or were last requested at least one checks frequency ago.
Nothing is requested while the periodic checks are disabled. A failed request is logged and
retried at the next call.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
