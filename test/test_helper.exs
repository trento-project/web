Mox.defmock(Trento.Commanded.Mock, for: Commanded.Application)

Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)

Mox.defmock(Trento.Integration.Telemetry.Mock, for: Trento.Integration.Telemetry.Gen)

Application.put_env(:trento, Trento.Integration.Telemetry,
  adapter: Trento.Integration.Telemetry.Mock
)

Mox.defmock(Trento.Integration.Checks.Mock, for: Trento.Integration.Checks.Gen)
Application.put_env(:trento, Trento.Integration.Checks, adapter: Trento.Integration.Checks.Mock)

Mox.defmock(Trento.Integration.Prometheus.Mock, for: Trento.Integration.Prometheus.Gen)

Application.put_env(:trento, Trento.Integration.Prometheus,
  adapter: Trento.Integration.Prometheus.Mock
)

Mox.defmock(Trento.Messaging.Adapters.Mock, for: Trento.Messaging.Adapters.Behaviour)
Application.put_env(:trento, :messaging, adapter: Trento.Messaging.Adapters.Mock)

Mox.defmock(GenRMQ.Processor.Mock, for: GenRMQ.Processor)

Mox.defmock(Trento.Support.DateService.Mock, for: Trento.Support.DateService)

Mox.defmock(Joken.CurrentTime.Mock, for: Joken.CurrentTime)
Application.put_env(:joken, :current_time_adapter, Joken.CurrentTime.Mock)

Application.ensure_all_started(:ex_machina, :faker)

ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Trento.Repo, :manual)
