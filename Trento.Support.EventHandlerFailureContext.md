# `Trento.Support.EventHandlerFailureContext`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/event_handler_failure_context.ex#L4)

Event handler failure context

max_retries: max retries before the event handler is shut down (default: 3)
retry_after: time between retries in ms (default: 500)
after_retry: callback to be called after reach retry
after_max_retries_reached: callback to be called when the max retries are reached
skip: if skip is true, the event will be skipped, otherwise the process will stop (default: false)

---

*Consult [api-reference.md](api-reference.md) for complete listing*
