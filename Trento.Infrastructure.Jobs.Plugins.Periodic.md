# `Trento.Infrastructure.Jobs.Plugins.Periodic`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/jobs/plugins/periodic.ex#L4)

Oban plugin that calls functions at a fixed interval, on the leader node only.

Used for the periodic tasks that need a resolution under one minute,
which Oban cron does not provide (for example the heartbeat check).
Runs are aligned to the wall clock and not persisted: a missed run is skipped.

    plugins: [
      {Trento.Infrastructure.Jobs.Plugins.Periodic,
       tasks: [
         heartbeat_check: [every: :timer.seconds(10), mfa: {Trento.Heartbeats, :dispatch_heartbeat_failed_commands, []}]
       ]}
    ]

# `child_spec`

Returns a specification to start this module under a supervisor.

See `Supervisor`.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
