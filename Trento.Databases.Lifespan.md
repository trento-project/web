# `Trento.Databases.Lifespan`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/databases/lifespan.ex#L4)

Database aggregate lifespan.

It controls the lifespan of the aggregate GenServer representing a database.

# `after_command`

# `after_error`

 If the aggregate is rolling up, it will be stopped to avoid processing any other event.

# `after_event`

The Database aggregate will be stopped after a DatabaseRollUpRequested event is received.
This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
