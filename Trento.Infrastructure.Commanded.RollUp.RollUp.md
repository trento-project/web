# `Trento.Infrastructure.Commanded.RollUp.RollUp`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/commanded/roll_up/roll_up.ex#L4)

This module is responsible for archiving a stream and appending a roll-up event to it.

This is done in a transaction to ensure that the stream is archived and the roll-up event is appended atomically.
Archived events are removed from the $all stream but they are still available in the original stream.

# `roll_up_aggregate`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
