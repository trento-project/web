# `Trento.Hosts.Lifespan`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/lifespan.ex#L4)

Host aggregate lifespan.

It controls the lifespan of the aggregate GenServer representing a host.

# `after_command`

# `after_error`

 If the aggregate is rolling up, it will be stopped to avoid processing any other event.

# `after_event`

The host aggregate will be stopped after a HostRollUpRequested event is received.
This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
