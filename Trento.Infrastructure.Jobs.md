# `Trento.Infrastructure.Jobs`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/jobs.ex#L4)

Periodic jobs run by Oban cron.

Each job runs once per schedule and ignores the result of the function it calls, so a
failure waits for the next run. Only raised exceptions are logged, see `attach_logger/0`.

The jobs are Oban crontab entries keyed by name, so an environment can change one entry
without repeating the others. `oban_config/0` drops the names, which Oban does not accept:

    config :trento, Oban,
      cron: [
        crontab: [
          discovery_events_pruning:
            {"0 3 * * *", Trento.Infrastructure.Jobs.DiscoveryEventsPruningJob,
             args: %{older_than: 10}}
        ]
      ]

Schedules use the crontab syntax of Linux cron, see crontab(5), converted to what Oban
cron accepts. The only difference: when both day of month and day of week are set, a
run needs both to match, while Linux cron needs either. A schedule outside that syntax
stops the boot with an error naming the job.

# `attach_logger`

```elixir
@spec attach_logger() :: :ok | {:error, :already_exists}
```

Logs the exceptions raised by the jobs, which Oban otherwise only stores in the job.

# `oban_config`

```elixir
@spec oban_config() :: keyword()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
