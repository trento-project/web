# `Trento.Support.JsonbSerializer`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/jsonb_serializer.ex#L4)

Serialize to/from PostgreSQL's native `jsonb` format.
Requires events to be defined by the `defevent` macro.

Configuration example:
```
config :trento, Trento.EventStore,
  serializer: Trento.Support.JsonbSerializer,
  column_data_type: "jsonb",
  types: EventStore.PostgresTypes
```

# `deserialize`

Deserialize a `jsonb` value from the event store into a struct.
This function is called by the event store when reading events and snapshots from the database.
In case the type supports upcasting (i.e. it has a `upcast/2` function),
the event is wrapped in an `IntermediateEvent` struct.
The upcaster protocol is implemented for `IntermediateEvent` and it will take care of calling the `new!/1` function
after the upcasting is done.
If a process manager supports superseding because it was renamed (i.e. it has a `superseded_by/0` function),
the snapshotted process manager is superseded by the new module.

# `serialize`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
