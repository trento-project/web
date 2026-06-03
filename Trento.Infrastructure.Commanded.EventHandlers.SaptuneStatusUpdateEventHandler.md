# `Trento.Infrastructure.Commanded.EventHandlers.SaptuneStatusUpdateEventHandler`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/commanded/event_handlers/saptune_status_update_event_handler.ex#L4)

Event handler to update saptune status when application or HANA database instances are registered/deregistered.
A host saptune health depends on SAP instances running on the host, so any update on that
needs to be applied in the saptune state health.

Full deregistration and restoration is handled as well, as some instances might still be in the
database as they might not be explicitly cleaned up.

# `child_spec`

Provides a child specification to allow the event handler to be easily
supervised.

Supports the same options as `start_link/3`.

The default options supported by `GenServer.start_link/3` are also
supported, including the `:hibernate_after` option which allows the
process to go into hibernation after a period of inactivity.

### Example

    Supervisor.start_link([
      {ExampleHandler, []}
    ], strategy: :one_for_one)

# `start_link`

Start an event handler `GenServer` process linked to the current process.

## Options

  - `:application` - the Commanded application.

  - `:name` - name of the event handler used to determine its unique event
    store subscription.

  - `:concurrency` - determines how many processes are started to
    concurrently process events. The default is one process.

  - `:consistency` - one of either `:eventual` (default) or `:strong`.

  - `:start_from` - where to start the event store subscription from when
    first created (default: `:origin`).

  - :subscribe_to - which stream to subscribe to can be either `:all` to
    subscribe to all events or a named stream (default: `:all`).

  - :batch_size - controls the EventStore subscription's in-flight buffer
    size. When `batch_timeout` is also set, this is the maximum number of
    events the handler buffers before flushing. Enables `handle_batch/1`.

  - :batch_timeout - maximum milliseconds to wait for events to accumulate
    in the handler buffer before flushing. Defaults to `:infinity` (no
    buffering; events processed immediately as delivered). Requires
    `:batch_size`.

The default options supported by `GenServer.start_link/3` are supported,
including the `:hibernate_after` option which allows the process to go
into hibernation after a period of inactivity.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
