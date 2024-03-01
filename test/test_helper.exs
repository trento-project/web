Mox.defmock(Trento.Commanded.Mock, for: Commanded.Application)

Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)

Mox.defmock(Trento.Infrastructure.Telemetry.Mock, for: Trento.Infrastructure.Telemetry.Gen)

Application.put_env(:trento, Trento.Infrastructure.Telemetry,
  adapter: Trento.Infrastructure.Telemetry.Mock
)

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
