Mox.defmock(Trento.Commanded.Mock, for: Commanded.Application)

Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)

Mox.defmock(Trento.Infrastructure.Prometheus.Mock, for: Trento.Infrastructure.Prometheus.Gen)

Application.put_env(:trento, Trento.Infrastructure.Prometheus,
  adapter: Trento.Infrastructure.Prometheus.Mock
)

Mox.defmock(Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock,
  for: Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor
)

Application.put_env(:trento, Trento.Infrastructure.SoftwareUpdates.SumaApi,
  executor: Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor.Mock
)

Mox.defmock(Trento.SoftwareUpdates.Discovery.Mock, for: Trento.SoftwareUpdates.Discovery.Gen)

Application.put_env(:trento, Trento.SoftwareUpdates.Discovery,
  adapter: Trento.SoftwareUpdates.Discovery.Mock
)

Mox.defmock(Trento.Infrastructure.SoftwareUpdates.Auth.Mock,
  for: Trento.Infrastructure.SoftwareUpdates.Auth.Gen
)

Application.put_env(:trento, Trento.Infrastructure.SoftwareUpdates.Suma,
  auth: Trento.Infrastructure.SoftwareUpdates.Auth.Mock
)

Mox.defmock(Trento.ActivityLog.ActivityLogger.Mock,
  for: Trento.ActivityLog.ActivityLogger
)

activity_log_config =
  :trento
  |> Application.fetch_env!(Trento.ActivityLog.ActivityLogger)
  |> Keyword.put(:adapter, Trento.ActivityLog.ActivityLogger.Mock)

Application.put_env(:trento, Trento.ActivityLog.ActivityLogger, activity_log_config)

Mox.defmock(Trento.Infrastructure.Messaging.Adapter.Mock,
  for: Trento.Infrastructure.Messaging.Adapter.Gen
)

Application.put_env(
  :trento,
  Trento.Infrastructure.Messaging,
  adapter: Trento.Infrastructure.Messaging.Adapter.Mock
)

Mox.defmock(GenRMQ.Processor.Mock, for: GenRMQ.Processor)

Mox.defmock(Trento.Support.DateService.Mock, for: Trento.Support.DateService)

Mox.defmock(Joken.CurrentTime.Mock, for: Joken.CurrentTime)
Application.put_env(:joken, :current_time_adapter, Joken.CurrentTime.Mock)

Application.ensure_all_started(:ex_machina, :faker)

ExUnit.start(capture_log: true)
Ecto.Adapters.SQL.Sandbox.mode(Trento.Repo, :manual)
