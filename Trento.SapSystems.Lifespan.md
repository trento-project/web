# `Trento.SapSystems.Lifespan`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/sap_systems/lifespan.ex#L4)

SapSystem aggregate lifespan.

It controls the lifespan of the aggregate GenServer representing a sap system.

# `after_command`

# `after_error`

 If the aggregate is rolling up, it will be stopped to avoid processing any other event.

# `after_event`

The SapSystem aggregate will be stopped after a SapSystemRollUpRequested event is received.
This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
