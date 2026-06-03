# `Trento.Support.IntermediateEvent`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/intermediate_event.ex#L4)

Represents an event that has been deserialized from the database, but not yet casted to its final type.

This is used to support upcasting of events.
The final event is built in the upcast protocol, so we can have access to the metadata.

# `t`

```elixir
@type t() :: %Trento.Support.IntermediateEvent{module: module(), term: any()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
